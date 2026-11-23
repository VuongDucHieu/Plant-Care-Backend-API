# Authentication — Risk Register

**Status:** Preliminary review. Ratings are qualitative hypotheses, not measured production data. Scale: likelihood (L) and impact (I) 1–3; score = L × I. Re-evaluate before production.

| ID | Risk / failure | L | I | Score | Mitigation | Verification |
|---|---|---:|---:|---:|---|---|
| R-AUTH-01 | Concurrent refresh produces two successors | 2 | 3 | 6 | Serialize by Session, conditional consume, unique parent | TC-09 |
| R-AUTH-02 | Strict reuse revokes legitimate Session after duplicate request | 3 | 2 | 6 | Client single-flight, avoid automatic retry, UX decision | TC-09, TC-13 |
| R-AUTH-03 | Logout/reuse races with refresh issuance | 2 | 3 | 6 | Same Session lock for all lifecycle mutations | TC-14 |
| R-AUTH-04 | Refresh token leaked via DB/logs | 2 | 3 | 6 | Hash/verifier only; redact logs, secrets hygiene | TC-11 |
| R-AUTH-05 | Token child belongs to different Session | 2 | 3 | 6 | DB composite constraint if feasible; transaction checks | TC-15 |
| R-AUTH-06 | JWT remains valid after logout | 3 | 2 | 6 | Define access-token revocation policy; short TTL or session check | TC-16 |
| R-AUTH-07 | CSRF on cookie-based refresh/logout | 2 | 3 | 6 | Choose cookie flags, Origin/CSRF defenses before web launch | TC-17 |
| R-AUTH-08 | Credential stuffing and user enumeration | 2 | 3 | 6 | Rate limit, generic errors, password hash | TC-18 |
| R-AUTH-09 | Retention too short loses reuse evidence; too long stores unnecessary metadata | 2 | 2 | 4 | Retention decision, cleanup tests, minimize PII | TC-19 |
| R-AUTH-10 | Incorrect Prisma 8 RC syntax or pending sample migration | 3 | 2 | 6 | CLI emit, inspect migration operations, test dev DB | TC-20 |

## Threat thinking template

For each new risk answer: **asset → attacker/failure → entry point → violated invariant → observable evidence → mitigation → regression test**.

### Worked example — R-AUTH-01

**Asset:** exclusive refresh-token lineage. **Failure:** two requests observe T1 as active. **Entry:** `/auth/refresh`. **Invariant:** one parent can yield at most one successor and cannot be consumed twice. **Evidence:** DB contains two children or two successful refresh responses. **Mitigation:** lock Session, conditional consume, unique parent, transaction. **Test:** concurrent requests against real PostgreSQL; inspect responses, rows and final Session state.

### Residual risk

Even with correct locking, strict reuse detection cannot distinguish a replay attack from a legitimate retry. This is a policy trade-off, not a bug fixable solely by database constraints. Document the user experience before release.
