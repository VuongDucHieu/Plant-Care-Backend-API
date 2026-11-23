# Authentication — Test Cases and Evidence Plan

**Status:** Designed, **not executed**. Related: [FSD](fsd.md), [Risks](risks.md).

## Evidence convention

For each executed case record: test ID, code/commit SHA, environment (PostgreSQL + Prisma versions), command, actual result, relevant sanitized DB state, pass/fail, issue reference. A test plan is **not** evidence of passing tests.

| ID | Level | Setup / action | Expected result | Requirement / risk |
|---|---|---|---|---|
| TC-01 | API+DB | Register new normalized email | One User; password hash only | FR-01 |
| TC-02 | API+DB | Register same email twice, including concurrent requests | Unique constraint enforced; one User | FR-01 |
| TC-03 | API+DB | Login with wrong password | Generic failure; no Session | FR-02 |
| TC-04 | API+DB | Login with valid credentials | One Session and one initial RefreshToken | FR-03 |
| TC-05 | DB+API | Refresh T1 once | T1 consumed, T2 created, same Session | FR-04 |
| TC-06 | DB | Rotate T1→T2→T3 | T2.parent=T1; T3.parent=T2; no fork | FR-05 |
| TC-07 | API+DB | Present consumed T1 again | Reject; revoke affected Session | FR-06 |
| TC-08 | API+DB | Present expired or otherwise revoked token | Reject; no successor; no false reuse classification | FR-07 |
| TC-09 | PostgreSQL concurrency | Send two simultaneous refresh requests for T1 | At most one successful consume/insert; strict reuse may revoke Session | FR-09, R-01/02 |
| TC-10 | PostgreSQL fault injection | Fail T2 insertion after consume update | Full rollback; T1 remains unconsumed | FR-10 |
| TC-11 | Security inspection | Inspect persisted records and sanitized logs | No raw refresh token/password | FR-11, R-04 |
| TC-12 | API+DB | User A requests User B's Plant | No cross-user data or mutation | FR-12 |
| TC-13 | API+DB | Commit rotation, simulate lost HTTP response, retry T1 | Strict policy behavior documented and verified | R-02 |
| TC-14 | PostgreSQL concurrency | Refresh races with logout/reuse revocation | No refresh issued that remains valid after revocation | R-03 |
| TC-15 | DB invariant | Attempt child referencing parent in another Session | Rejected by DB constraint or validated atomic repository operation | R-05 |
| TC-16 | API | Access old access JWT after logout | Matches explicit revocation policy; currently TBD | R-06 |
| TC-17 | Security API | Cross-site cookie refresh/logout request | Rejected according to chosen CSRF policy; currently TBD | R-07 |
| TC-18 | Security API | Many invalid logins / enumerate email | Rate limiting and generic response; thresholds TBD | R-08 |
| TC-19 | DB/job | Retention purge of historical tokens | Meets retention policy and preserves required audit evidence; TBD | R-09 |
| TC-20 | CLI+DB | Emit contract, inspect migration operations, apply to test DB | No sample Post table; expected schema and constraints | R-10 |

## Deep-dive: concurrency test TC-09

**Given:** one active Session and T1 with `consumedAt = null`. **When:** two independent requests submit T1 at approximately the same time, using a synchronization barrier rather than relying only on timing. **Then:** the database contains at most one child with `parentTokenId=T1.id`; T1 was consumed once; the Session's final state matches strict reuse policy; no raw token is logged. Repeat the test across multiple runs to increase the chance of exposing a race. A single passing run does not prove race freedom.

## Deep-dive: rollback test TC-10

**Given:** valid T1. **When:** a controlled DB constraint/fault causes successor insertion to fail after the consume attempt within one transaction. **Then:** T1's `consumedAt` is still NULL, no T2 exists, and API returns an error without exposing a new token. The failure injection must be reproducible.

## Test organization suggestion

- Unit: domain status rules and use-case branching with fakes.
- Integration: PostgreSQL transaction, locks, constraints, foreign keys, rotation lineage.
- HTTP integration: validation, status codes, auth context, cookies/headers.
- UAT: user-visible register, login, logout, return to saved plants. Do not substitute UAT for race/security tests.

## Minimal execution record template

```text
Test ID:
Commit:
Environment:
Command:
Expected:
Actual:
Evidence (redacted):
Result: PASS / FAIL / BLOCKED
Follow-up issue:
```
