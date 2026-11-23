# Authentication — Technical Design

**Status:** Proposed; subject to approval of [FSD section 8](fsd.md). **Implementation:** Not yet verified. This is the architecture specification, not an implementation report.

## 1. Boundaries

`HTTP Router → Controller (Zod validation) → Use Case → Repository ports → PostgreSQL adapter`.

- HTTP owns input parsing, response mapping, and authentication middleware.
- Use Cases own register/login/refresh/logout policy; they do not import Express or ORM models.
- Repository adapter owns atomic transactions, constraints, and PostgreSQL session locking.
- Password hasher, token issuer/verifier and clock are injected ports for testability.

## 2. Data ownership and invariants

| Entity | Required fields | Invariants |
|---|---|---|
| User | id, normalized email, passwordHash, createdAt, updatedAt | Unique normalized email; no plaintext password |
| Session | id, userId, expiresAt, revokedAt?, revokedReason?, createdAt | Stable across refresh; revoked Session cannot authorize requests |
| RefreshToken | id, sessionId, parentTokenId?, tokenHash, expiresAt, consumedAt?, revokedAt?, revokedReason?, createdAt | Unique tokenHash; unique nullable parentTokenId; same-session lineage; consumed at most once |
| Plant | id, ownerId, displayName, identificationSnapshot?, timestamps | Ownership derives from authenticated user ID |

`consumedAt` denotes successful rotation; `revokedAt` denotes explicit invalidation. Both may be populated for historical incident records. `revokedReason` must be present iff `revokedAt` is present. A token's `parentTokenId` must reference a token in **the same Session**; a simple FK to token ID does not enforce this. Prefer composite FK `(parentTokenId, sessionId) → (id, sessionId)` with a corresponding unique key, if supported by the emitted migration; otherwise enforce via serialized writes and verify with real PostgreSQL tests. Direct DB writes outside the repository must not bypass this rule.

## 3. Credential policy

See [FSD §8](fsd.md) for the canonical numbers and HTTP contracts. Access JWT contains `sub`, `sid`, `iat`, `exp`, issuer and audience. Verify signature, allowed algorithm, issuer, audience, expiry and active Session on every protected request. Use an opaque high-entropy refresh secret, persist only keyed HMAC-SHA-256 verifier using a separate key. Passwords use Argon2id with explicitly configured parameters. Never log raw tokens or passwords.

## 4. Rotation algorithm — required transactional semantics

1. Compute token verifier; locate its RefreshToken row. If unknown, return 401 without revealing existence.
2. Start transaction and lock the corresponding Session row (`SELECT ... FOR UPDATE` or verified equivalent). Every logout and reuse-revocation path locks the **same row**.
3. Re-read Session and token **after** obtaining lock; use database time for expiry comparison. If Session inactive or token expired/explicitly revoked, reject without rotation.
4. If `consumedAt` is already set, mark Session revoked with reason `REUSE_DETECTED` in this transaction, **commit** revocation, then return 401. Do not throw inside a transaction callback in a way that rolls back revocation.
5. Otherwise conditionally set `consumedAt` only when NULL, token unrevoked and unexpired. Assert exactly one row changed.
6. Insert child token with `parentTokenId` pointing to the parent and the **same** `sessionId`; ensure parent uniqueness. Commit before returning the new credential.
7. If child insertion fails, rollback all mutations including `consumedAt`. Never return credentials before commit.

Concurrency result: two requests using T1 may yield one successful rotation and one reuse-triggered Session revocation; the first returned access token becomes unusable on subsequent protected requests. This is the intentional strict policy and UX trade-off. Client must use single-flight refresh; it cannot guarantee against response-loss retries.

## 5. Logout, registration and authorization

- Register normalizes email, validates password length, hashes with Argon2id and creates User; no automatic login.
- Login verifies password with generic failure response and creates Session plus initial RefreshToken atomically.
- Logout authenticates JWT + active Session, locks Session, sets `revokedAt` and `revokedReason=LOGOUT`, commits and returns 204. A repeated call with revoked JWT returns 401 per MVP policy.
- `/auth/me` and future My Plants endpoints validate JWT and Session. Queries use `(plantId, authenticatedUserId)`; never accept `ownerId` from the client.
- Identify/Diagnose remain public during this MVP.

## 6. Trade-offs

| Choice | Benefit | Cost |
|---|---|---|
| Stable Session + token history | Audit and replay detection | Extra rows, retention responsibility |
| Strict consumed-token reuse revocation | Strong replay response | Legitimate duplicate refresh can log user out |
| Session check on every protected request | Subsequent requests reject logged-out sessions | Database read per request |
| Session row lock + conditional consume | Consistent refresh/logout ordering | Contention and adapter complexity |
| JSON refresh token for trusted/mobile-style client | Avoid cookie-specific CSRF in MVP | Client must securely store token; unsuitable for unmodified browser SPA |

## 7. Failure and debugging

- DB unavailable: fail closed; emit safe error and correlation ID.
- JWT valid but Session revoked: 401.
- Child insert fails: verify transaction rollback leaves parent unconsumed.
- Concurrent refresh/logout: capture DB transaction ordering and final Session state; do not log secrets.
- Prisma 8 RC migration: contract syntax and emitted constraints must be verified locally; this document does **not** assert a particular untested Prisma API for row locking.

## 8. Implementation sequence

Validate approved specification → update Prisma Contract → emit and inspect migration → apply to isolated disposable DB → PostgreSQL constraints tests → Register/Login → Refresh/Logout → JWT middleware and `/auth/me` → API and concurrency tests. Do not reset a persistent database without explicit confirmation.

## Idle timeout, logout semantics and composite-FK verification

- Session stores `lastActivityAt`; effective validity requires `now < expiresAt`, `now < lastActivityAt + idleTimeout` and `revokedAt IS NULL`. Proposed idle timeout is 24 hours, pending approval. Successful protected requests and refreshes update activity monotonically; unsuccessful requests do not. Absolute expiry never moves.
- Repeated logout using the revoked Session JWT returns `401`. Client silently clears local auth state and treats logout as completed; no error notification.
- **Database defense:** require composite FK `(parentTokenId, sessionId)` referencing unique `(id, sessionId)` in `RefreshToken`, alongside unique `parentTokenId`. If Prisma migration cannot express it, use reviewed SQL; inspect PostgreSQL metadata.
- **Prisma Client relation join is NOT VERIFIED.** TC-AUTH-26 must create Session A/B, parent P in A, child C in A; include parent via Prisma Client and assert returned parent ID and Session A. TC-AUTH-27 must prove PostgreSQL rejects a child in B referencing P in A. No passing claim until executed on real DB.
