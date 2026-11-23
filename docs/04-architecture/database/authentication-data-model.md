# Authentication — Data Model and Integrity Contract

**Status:** Proposed · **Scope:** PostgreSQL persistence for register, login, refresh, logout. This document is a logical schema, **not executable Prisma 8 RC syntax**.

## 1. Why four models?

| Model | Ownership | Responsibility | Not responsible for |
|---|---|---|---|
| `User` | Account | Identity and password verifier | Device session state |
| `Session` | One login/device context | Stable security boundary; expiry and revocation | Storing only the latest token hash |
| `RefreshToken` | One Session | One credential generation, consumption, lineage | Authenticating ordinary API calls |
| `Plant` | One User | Persisted plant ownership | Refresh-token lifecycle |

A login creates a new Session and its first RefreshToken. A successful refresh consumes one token and creates a child token **without creating another Session**. Logout revokes the Session; token rows may be retained for bounded audit/reuse detection.

## 2. Proposed fields and constraints

### User
- `id`: stable primary key; generation mechanism to be verified against Prisma 8 contract.
- `email`: unique normalized identity (define normalization and DB collation/case strategy before migration).
- `passwordHash`: password-specific verifier, e.g. Argon2id; never return it in API.
- `createdAt` and optional profile fields according to approved scope.

### Session
- `id`: primary key.
- `userId`: non-null FK to User.
- `expiresAt`: absolute maximum session lifetime (proposed; business/security policy pending).
- `revokedAt`: nullable timestamp.
- `revokedReason`: nullable controlled value, such as `LOGOUT`, `ADMIN_REVOKED`, `REUSE_DETECTED`.
- `createdAt`: creation timestamp.
- Suggested index: `(userId, revokedAt)` for session listing/revocation queries.

### RefreshToken
- `id`: primary key.
- `sessionId`: non-null FK to Session.
- `tokenHash`: unique verifier of a cryptographically random opaque token. Consider keyed HMAC-SHA-256 with a separate server secret and key-version migration policy; do not reuse password hashing rules blindly.
- `parentTokenId`: nullable self-reference, unique when non-null; first token has null parent.
- `expiresAt`: absolute token expiry.
- `consumedAt`: nullable, set once on successful rotation.
- `revokedAt`, `revokedReason`: nullable, explicit invalidation/audit; distinct from consumption.
- `createdAt`: creation timestamp.
- Suggested indexes: unique `tokenHash`, unique `parentTokenId`, `(sessionId, revokedAt)`; check actual query plans before adding further indexes.

### Plant
- `id`: primary key.
- `ownerId`: non-null FK to User; ownership queries must use authenticated user ID.
- Other plant fields belong to the My Plants feature, not the authentication schema contract.

## 3. Invariants (what must always be true?)

| ID | Invariant | Enforcement / proof |
|---|---|---|
| INV-01 | Token belongs to exactly one Session | Non-null FK `RefreshToken.sessionId` |
| INV-02 | A parent token has at most one child | Unique `parentTokenId` (multiple NULLs permitted in PostgreSQL by default) |
| INV-03 | Parent and child belong to the **same** Session | Prefer composite FK `(parentTokenId, sessionId)` referencing unique `(id, sessionId)` if supported; otherwise transaction validation plus integration test |
| INV-04 | A token is consumed at most once | Conditional DB update and row-count check inside transaction |
| INV-05 | Revoked/expired Session cannot refresh | Check Session under lock in the same transaction |
| INV-06 | Expired/revoked token cannot refresh | Check expiry/revocation under lock, and conditional update |
| INV-07 | `revokedReason` is present iff `revokedAt` is present | Database CHECK constraint if migration supports it; otherwise validation plus DB-level test |
| INV-08 | Refresh token plaintext never persists | Repository/API/logging tests and secrets audit |
| INV-09 | User A cannot read User B's Plant | Query predicate `(plantId, authenticatedUserId)` and isolation test |

**Important:** `UNIQUE(parentTokenId)` does not guarantee same-session lineage. A self-FK to token ID alone is insufficient. Also, a consumed token may later have `revokedAt` set when the Session is revoked; this is not contradictory.

## 4. State semantics

| Token state | Derivation | Refresh action |
|---|---|---|
| Active | No `consumedAt`/`revokedAt`, not expired; Session active | Eligible for rotation |
| Consumed | `consumedAt` non-null | Reuse detection under strict policy |
| Revoked | `revokedAt` non-null | Reject; do not automatically label as replay |
| Expired | Current DB time >= `expiresAt` | Reject; do not automatically label as replay |
| Session revoked | Parent Session has `revokedAt` | Reject irrespective of token fields |

**Precedence decision:** When Session is already revoked, reject without issuing another revocation. When a token is both consumed and explicitly revoked, preserve the original audit facts and define reuse classification carefully rather than assuming every rejected token is an attack.

## 5. Trade-offs and risks

- **Separate token rows** improve auditability and replay detection, at the cost of storage and retention management.
- **Strict reuse policy** limits replay persistence but may revoke legitimate sessions due to simultaneous requests or retries.
- **Session row locking** simplifies consistency across rotation, logout and reuse; it can create contention for a busy Session.
- **Composite FK** provides stronger DB protection but may require raw SQL or specific Prisma 8 RC support; never assume the ORM contract supports it without a successful emit/migration.
- **Opaque random tokens + keyed hash** enable indexed lookup; the verifier key must be managed and rotated independently of JWT signing keys.

## 6. Explain-back exercise

Explain without looking at the schema: Why does `RefreshToken.parentTokenId @unique` prevent two children but not prevent a child of Session B from referencing a parent of Session A? Which test would expose that? What additional database constraint could close the gap?

## 7. Evidence required before marking Implemented

1. Contract emitted successfully using project Prisma 8 RC toolchain.
2. Migration SQL inspected and applied to an isolated disposable database.
3. DB metadata proves unique/FK/check constraints exist.
4. Integration tests demonstrate duplicate successor and cross-session lineage are rejected.
5. No plaintext token in DB or logs; no access across User ownership boundaries.

Related: `../../03-features/authentication/design.md` (when assembled in target repository), `rotation-transaction.md` in feature folder.
