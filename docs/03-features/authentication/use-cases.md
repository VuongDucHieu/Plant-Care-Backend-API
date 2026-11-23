# Authentication — Use Case Specifications

**Status:** Draft; behavior proposed, not implemented. Related: [FSD](fsd.md).

## UC-AUTH-01 — Register

**Actor:** Visitor. **Goal:** Create an account for future personal plant ownership.

**Preconditions:** Service is available; email/password supplied.

**Main flow:** (1) Visitor submits credentials. (2) System validates input and normalizes email under the agreed policy. (3) System hashes password using a password-specific algorithm. (4) Database creates User under unique-email constraint. (5) System returns success without exposing password hash.

**Alternatives:** Invalid input → validation failure. Existing email → controlled duplicate error; concurrent registrations must not create two users. Database failure → no partial user.

**Postcondition:** Exactly one account for the normalized email. Whether registration also logs in is unresolved.

## UC-AUTH-02 — Login

**Actor:** Registered user. **Goal:** Establish an authenticated session.

**Main flow:** (1) Submit email/password. (2) Verify password against stored hash. (3) Create Session and initial RefreshToken atomically. (4) Issue access credential and refresh credential via selected transport.

**Alternatives:** Wrong email/password → generic failure and no Session. Storage failure → rollback. Rate limiting may reject abusive attempts.

**Postcondition:** One new Session and one active initial RefreshToken. Two independent logins may create two sessions.

## UC-AUTH-03 — Refresh with rotation

**Actor:** Authenticated client holding refresh credential. **Goal:** Renew access without reentering password.

**Preconditions:** Session active; token authentic, unexpired, unconsumed, unrevoked.

**Main flow:** (1) Submit T1. (2) Resolve token hash and associated Session. (3) Serialize operations on the Session in a database transaction. (4) Check Session and T1. (5) Conditionally mark T1 consumed. (6) Insert T2 with `parentTokenId=T1.id`, same `sessionId`. (7) Commit. (8) Return new credentials.

**Alternatives:** Consumed T1 → reject and revoke affected Session under strict policy; expired/otherwise revoked T1 → reject without automatically claiming reuse; inactive Session → reject. Concurrent requests → at most one successful consume, but strict reuse may revoke the Session afterward. Insert failure → rollback consume.

**Postcondition:** T1 has one successor at most; no partial rotation; no active token on a revoked Session.

## UC-AUTH-04 — Logout

**Actor:** Authenticated user. **Goal:** End current Session.

**Main flow:** (1) Identify Session from authenticated credential. (2) Revoke Session. (3) Clear client credential according to selected transport. (4) Return success.

**Alternatives:** Already revoked → idempotent handling policy to be defined. Expired access credential → logout API policy to be defined.

**Postcondition:** Future refresh is denied. Already-issued access tokens may remain usable until expiry unless session status is checked on protected requests; this must be decided explicitly.

## UC-AUTH-05 — Access own plants

**Actor:** Authenticated user. **Goal:** Read/write only plants belonging to self.

**Main flow:** (1) Validate access credential. (2) Derive `userId` from verified authentication context. (3) Query/mutate Plant using `ownerId=userId`. (4) Return only authorized data.

**Alternative:** Plant owned by another user → no data disclosure; choose 404/403 consistently in API contract.

**Postcondition:** No cross-account access. This use case depends on My Plants implementation.
