# Authentication — Test Cases

**Status:** Acceptance plan; tests not executed. Requirement IDs refer to [FSD](fsd.md). A test is PASS only after code, environment and evidence are recorded.

| ID | Level | Scenario | Expected |
|---|---|---|---|
| TC-AUTH-01 | HTTP+DB | Register new normalized email | 201, one User, no Session; no plaintext password |
| TC-AUTH-02 | HTTP+DB | Duplicate email (including concurrent attempts) | 409; unique DB constraint; one User |
| TC-AUTH-03 | HTTP+DB | Invalid login | 401 generic response; no Session created |
| TC-AUTH-04 | HTTP+DB | Valid login | 200; one Session and initial RefreshToken, no raw token stored |
| TC-AUTH-05 | HTTP+DB | Refresh T1 once | T1 consumed, T2 inserted with parent T1, same Session |
| TC-AUTH-06 | HTTP+DB | Reuse consumed T1 | 401; Session revoked with REUSE_DETECTED; revocation **committed** |
| TC-AUTH-07 | HTTP+DB | Expired/explicitly revoked token or expired/revoked Session | 401, no successor, no false reuse classification |
| TC-AUTH-08 | HTTP+DB | Logout and refresh | 204 logout; refresh 401; other Session unaffected |
| TC-AUTH-09 | PostgreSQL race | Two refreshes of T1 synchronized at critical section | At most one child; strict reuse may revoke Session |
| TC-AUTH-10 | PostgreSQL fault | Child insert fails after consume attempt | Full rollback, parent still unconsumed |
| TC-AUTH-11 | Security | Inspect DB and logs | No raw password/refresh token or JWT in logs |
| TC-AUTH-12 | HTTP+DB | User A attempts to access User B plant | No cross-user access; execute when My Plants exists |
| TC-AUTH-13 | HTTP+DB | Response lost after T1 commit, client retries T1 | 401 and affected Session revoked; documented UX cost |
| TC-AUTH-14 | PostgreSQL race | Refresh and logout overlap | Serialized; subsequent protected request rejects revoked Session |
| TC-AUTH-15 | DB | Cross-session parent link and duplicate child | Rejected by approved invariant enforcement |
| TC-AUTH-16 | HTTP+DB | Access JWT after logout | 401 on subsequent protected request |
| TC-AUTH-17 | HTTP | Refresh in JSON body; no cookies set | Matches MVP transport; cookie-CSRF test deferred to browser-cookie feature |
| TC-AUTH-18 | Security | Repeated invalid login attempts | No account enumeration; rate limiter required before public production release |
| TC-AUTH-19 | DB | Expiry boundaries: 15m access, 7d refresh, 30d Session | Tokens and Sessions rejected at/after expiry |
| TC-AUTH-20 | CLI+DB | Emit contract, inspect and apply migration to disposable DB | Expected four models, unique/FK constraints; no sample Post table |
| TC-AUTH-21 | HTTP | Register password length 11,12,128,129 | 11/129 rejected, 12/128 accepted if otherwise valid |
| TC-AUTH-22 | HTTP | GET /auth/me with valid/invalid JWT | 200 id/email or 401; no password hash |
| TC-AUTH-23 | HTTP+client | Repeat logout with same revoked JWT | API returns 401; client clears access/refresh/user/session state, reports logout completed and shows no error toast |
| TC-AUTH-24 | HTTP | Malformed requests and duplicate email | 400 / 409 and consistent `{error:{code,message}}` envelope |
| TC-AUTH-25 | HTTP+DB | Idle boundary: successful activity, then advance clock to just before/at/after `lastActivityAt + idleTimeout`; absolute expiry remains fixed | Activity extends idle window but not absolute TTL; at/after idle expiry `/auth/me` and refresh return 401; failed requests do not extend idle |
| TC-AUTH-26 | Prisma Client + real PostgreSQL | Create Session A and B; parent P in A; valid child C in A; fetch C including `parent` via Prisma Client | `child.sessionId=A.id`, `child.parentTokenId=P.id`, `child.parent.id=P.id`, `child.parent.sessionId=A.id`; fail immediately on any mismatch; verify FK in DB |
| TC-AUTH-27 | PostgreSQL constraint | Attempt child in Session B with parent P from Session A | PostgreSQL rejects insert due to composite FK; transaction rolls back |

## Concurrency test method

Use two independent PostgreSQL connections and a controlled barrier around lock acquisition, not only `Promise.allSettled`. Assert DB final state (child count, consumedAt, Session.revokedAt), not fixed response arrival order. Repeat with transaction instrumentation. Tests against fakes cannot prove database locking behavior.

## Test evidence record

```text
Test ID:
Commit SHA:
Prisma/PostgreSQL versions:
Command:
Expected / Actual:
Sanitized DB evidence:
PASS / FAIL / BLOCKED:
Issue or follow-up:
```

**Out-of-scope gates:** My Plants ownership test remains blocked until My Plants exists. Cookie CSRF is not applicable to this JSON-token MVP, but must be added if cookie transport is introduced. Rate limiting is a production-release gate; thresholds and middleware must be decided and tested before internet exposure. Retention cleanup is not implemented in MVP; document residual risk rather than claiming a passed retention test.

## TC-AUTH-26 — Prisma Client composite-FK relation verification

**Precondition:** Composite FK exists in PostgreSQL; Prisma Client exposes the parent relation. **Status: NOT EXECUTED; relation name and client API must be adapted to generated Prisma 8 RC client.**

1. In isolated test database create two distinct Sessions, `A` and `B` (with required User records).
2. Insert parent RefreshToken `P` with `sessionId=A.id` and `parentTokenId=null`.
3. Insert child RefreshToken `C` with `sessionId=A.id` and `parentTokenId=P.id`.
4. Fetch `C` using Prisma Client relation include/select for `parent` (not a separate manually constructed lookup).
5. **Fail immediately** unless the returned `child.id===C.id`, `child.sessionId===A.id`, `child.parentTokenId===P.id`, `child.parent?.id===P.id` and `child.parent?.sessionId===A.id`.
6. Separately attempt a token in `B` with `parentTokenId=P.id`; assert a PostgreSQL FK violation, not merely an application validation error.
7. Cleanup in a transaction or disposable schema. Record Prisma version, generated client relation API, SQL constraint name and actual result.

**Important:** A successful insert and FK metadata check do not prove Prisma Client's relation join is correct; both checks are required. Do not mark PASS until executed.
