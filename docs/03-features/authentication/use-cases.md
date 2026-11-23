# Authentication — Use Cases

**Status:** Proposed. Canonical security and API policies: [FSD §8](fsd.md).

## UC-AUTH-01 Register

**Actor:** Visitor. **Precondition:** Valid email/password supplied. **Main:** validate and normalize email (`trim().toLowerCase()`), enforce password length 12–128, hash with Argon2id, insert User, return 201 with id/email. **Alternatives:** malformed input 400; duplicate normalized email 409; DB error no partial User. **Postcondition:** User created; no Session created.

## UC-AUTH-02 Login

**Actor:** Registered user. **Main:** validate input; look up normalized email; verify password without leaking account existence; transactionally create Session and initial RefreshToken; issue JWT and opaque refresh secret; return 200 credential envelope. **Alternatives:** invalid credentials 401; DB error rolls back both rows. **Postcondition:** one new active Session and initial token; multiple independent logins may create separate Sessions.

## UC-AUTH-03 Refresh

**Actor:** Client possessing refresh secret. **Preconditions:** Session active (neither revoked nor past absolute/idle expiry); token authentic, unexpired, unconsumed, unrevoked. **Main:** derive token verifier; lock Session in transaction; re-read state; conditionally consume T1; insert T2 with same Session and parent=T1; commit; return 200 new credentials. **Alternatives:** consumed T1 revokes affected Session and returns 401 **after commit**; expired/explicitly revoked token or Session returns 401 without successor; child insertion error rolls back. **Postcondition:** at most one child per parent; no partial rotation.

## UC-AUTH-04 Logout

**Actor:** Authenticated user. **Precondition:** valid JWT and active Session. **Main:** lock Session; revoke with `LOGOUT`; commit; return 204 without body. **Alternatives:** invalid/expired JWT or revoked Session 401. **Repeated logout:** Same access JWT against the revoked Session returns HTTP `401` as expected. Client silently clears local authentication state and considers logout completed; no user-facing error.

**Postcondition:** Future refresh is denied.

## UC-AUTH-05 Get current user

**Actor:** Authenticated user. **Main:** verify JWT signature, issuer, audience, expiry and active `sid` Session; read User by `sub`; return id/email. **Alternatives:** invalid JWT, missing/revoked/expired Session, missing User → 401. **Postcondition:** no password hash exposed.

## UC-AUTH-06 My Plants ownership boundary (dependent feature)

**Actor:** Authenticated user. **Main:** verify JWT and Session; derive `userId` from `sub`; query/mutate Plant scoped to `ownerId=userId`. **Alternative:** another user's plant → no data disclosed (404 recommended; final My Plants API contract owns the choice). **Postcondition:** no cross-account read/write. My Plants feature itself remains out of scope for this implementation slice.
