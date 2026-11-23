# Authentication — Rotation Transaction, Concurrency and Failure Proof

**Status:** Proposed algorithm, not production code. **Assumption:** PostgreSQL READ COMMITTED; both rotation and revocation serialize on the Session row.

## 1. The race we must prevent

Request A and Request B carry the same token T1. Without a serialization mechanism, both can read `consumedAt = NULL` and attempt to create T2/T3. A transaction alone does not prevent both transactions from reading the same initial state.

## 2. Proposed transactional protocol

1. Parse token format and compute lookup verifier. Never log the raw token.
2. Begin DB transaction. Look up the token's Session ID without trusting user-supplied Session IDs.
3. Lock the **Session row** (`SELECT ... FOR UPDATE`) to serialize rotation, logout and reuse revocation.
4. **After acquiring the lock**, re-read Session and token states from the database. Reject if Session revoked/expired, token revoked/expired, or token missing.
5. If `consumedAt` is already set, treat as reuse under the chosen strict policy: revoke Session, commit that security state, return a generic 401.
6. Otherwise perform conditional consume (`UPDATE ... WHERE consumedAt IS NULL AND revokedAt IS NULL AND expiresAt > database_now ... RETURNING ...`). Assert exactly one row updated.
7. Insert child token with `parentTokenId = T1.id` and the **same Session ID**. DB unique/FK constraints must reject conflicting lineage.
8. Commit. Only after successful commit send new credentials to client. Never send a token whose database insert rolled back.

**Implementation caution:** The order of checking Session and token matters. If a previous request has already revoked Session, reject rather than trying to repeat incident handling. Use DB server time consistently for expiry comparisons.

## 3. Concurrent strict-reuse outcome

- A acquires lock, consumes T1, creates T2, commits.
- B then acquires the same lock, observes T1 consumed, revokes Session, commits, receives 401.
- A may already have received T2, but T2 is now unusable for refresh because Session is revoked.
- This is **expected under strict policy**, not proof of a bug. It is a UX trade-off requiring client single-flight refresh and possibly a later policy change.

## 4. Failure matrix

| Failure | Expected DB state | Required test |
|---|---|---|
| Child insert violates unique constraint | T1 consumption rolls back | Inject duplicate child/constraint failure |
| DB connection drops before commit | No partial committed rotation | Transaction rollback integration test |
| Logout races with refresh | Serialized; no usable refresh after logout commits | Parallel logout/refresh test |
| Reuse races with refresh | Serialized and Session revoked under strict policy | Parallel replay/refresh test |
| Parent references another Session | Rejected by composite FK or application transaction check | Cross-session lineage test |
| Token expired while waiting for lock | Recheck after lock; reject | Expiry boundary test |
| Two active child tokens from same parent | Must be impossible | DB unique constraint test |

## 5. Test design (Vitest + PostgreSQL, not mock-only)

- **TC-ROT-01:** One valid refresh creates one child, sets consumedAt, maintains Session ID.
- **TC-ROT-02:** Reuse of T1 revokes its Session, but not a separate Session of the same user.
- **TC-ROT-03:** `Promise.allSettled` two refresh requests using the same T1; assert one successor maximum and Session revoked under strict policy. Network response order is nondeterministic; do not assert a fixed winner.
- **TC-ROT-04:** Force child insert failure; assert T1 remains unconsumed.
- **TC-ROT-05:** Concurrent logout and refresh; assert eventual Session revocation and no subsequent successful refresh.
- **TC-ROT-06:** Attempt cross-session parent link; assert rejected.
- **TC-ROT-07:** Expired token/session returns 401 with no new token.

**Warning:** `Promise.allSettled` alone does not guarantee requests overlap at the critical section. For deterministic race testing, introduce a controlled barrier in a test adapter or use multiple DB connections with explicit locks; run repeated integration tests to supplement deterministic cases.

## 6. Debugging protocol

1. Record expected vs actual token/Session state using IDs only (never raw tokens).
2. Capture transaction sequence, DB error code and constraint name.
3. Check whether both code paths lock the **same Session row** and re-read state **after** lock.
4. Reproduce with two independent DB connections.
5. Fix one invariant at a time; rerun happy path, replay, rollback and logout tests.
6. Update the ADR/test case if the underlying design assumption was wrong.

## 7. Design review questions

- Why isn't `BEGIN ... COMMIT` alone enough?
- Why is locking only the RefreshToken row insufficient if logout only locks Session?
- What happens if a 200 response is lost and the client retries T1?
- Which state must be committed when reuse is detected, and why must that transaction not roll back?
