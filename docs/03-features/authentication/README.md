# Authentication

> **Feature status:** Designed — awaiting approval; not implemented.  
> **Scope:** Register · Login · Refresh Token Rotation · Logout · Current User (`/auth/me`).  
> **Business outcome:** Users can securely access their own saved plants across visits.

## 1. Overview

Authentication establishes a user's identity and manages login sessions. A successful login creates a **Session** and its first **RefreshToken**. Refreshing consumes the current token and issues a successor **within the same Session**. Reusing a consumed token revokes the affected Session under the proposed strict policy. Protected operations derive the user identity from verified credentials; they must not trust a client-provided `ownerId`.

**New acceptance requirements:** idle timeout (proposed 24h, awaiting approval), repeated logout returns `401` and is handled silently by the client, and PostgreSQL composite FK protects token lineage. Prisma Client relation joins remain **unverified until integration tests pass**.

**Important:** This folder describes the intended behavior. It does not mean Authentication has been implemented or tested.

## 2. Documentation reading path

**New to this feature? Read the documents in the following order.** Each step builds on the previous one; use the links to open the actual files.

| Step | Document | What you will understand | Read it before… |
|:---:|---|---|---|
| **01** | **[Functional Specification (FSD)](fsd.md)** | Scope, functional requirements, business/security rules, API behavior and decisions awaiting approval | Discussing how to build the feature |
| **02** | **[Use Case Specifications](use-cases.md)** | How Register, Login, Refresh, Logout and ownership checks behave, including alternative flows | Designing the application logic |
| **03** | **[Technical Design](design.md)** | Component responsibilities, data relationships, transaction boundaries and architectural trade-offs | Writing repositories and use cases |
| **04** | **[Risk Register](risks.md)** | Security threats, failure modes, mitigation strategies and residual risks | Implementing security-sensitive behavior |
| **05** | **[Test Cases](test-cases.md)** | What must be verified and what evidence counts as a passing test | Marking the feature complete |

### Deep dives and supporting references

These documents are **not extra mandatory steps** in the main reading path. Open them when the corresponding question arises.

| Document | When to read it |
|---|---|
| [Refresh Rotation Transaction](rotation-transaction.md) | When implementing or debugging locking, concurrent refresh, reuse detection and rollback |
| [Authentication Data Model](../../04-architecture/database/authentication-data-model.md) | When designing the PostgreSQL schema, keys, relationships and invariants |
| [Database Migration Runbook](../../04-architecture/database/migration-runbook.md) | Before generating, reviewing or applying a database migration |
| [Troubleshooting](troubleshooting.md) | When reproducing a failure, investigating its cause or recording a confirmed fix |

## 3. How the documents work together

| Question | Source of truth |
|---|---|
| **What must the system do?** | [FSD](fsd.md) |
| **What happens in each user/system flow?** | [Use Cases](use-cases.md) |
| **How should the system be structured?** | [Technical Design](design.md) and [Data Model](../../04-architecture/database/authentication-data-model.md) |
| **What can fail, and how do we reduce the risk?** | [Risk Register](risks.md) |
| **How do we prove the behavior works?** | [Test Cases](test-cases.md) |
| **How do we investigate a failure?** | [Troubleshooting](troubleshooting.md) |

**Documentation rule:** Change the relevant source document when a requirement or design decision changes. Update linked tests and dependent sections in the same change. Do not create separate comparison documents to describe discrepancies between code and docs; implementation must follow the approved docs.

## 4. Implementation sequence

After the FSD and design decisions are approved, implement the feature in this order:

1. **Persistence:** Validate the Prisma Contract and review the PostgreSQL migration against the [Data Model](../../04-architecture/database/authentication-data-model.md) and [Migration Runbook](../../04-architecture/database/migration-runbook.md).
2. **Application:** Implement repositories and use cases for Register and Login; then Refresh and Logout.
3. **HTTP:** Add request validation, controllers, routes, error mapping and authenticated user context.
4. **Verification:** Execute unit, API and real-PostgreSQL integration tests, including concurrent refresh and rollback scenarios in [Test Cases](test-cases.md).
5. **Integration:** Enforce verified user ownership when My Plants is implemented.

**Do not apply migrations to a database containing valuable data without reviewing the generated operations and confirming the rollback/backup plan.**

## 5. Approval and completion criteria

**Before coding:** Review and approve the security/transport/lifetime decisions in [FSD — Section 8](fsd.md). In particular, confirm token transport, access-token and Session lifetimes, logout enforcement, and strict reuse behavior. Until approved, these are proposals rather than final product decisions.

**Definition of Done:**

- [ ] FSD and relevant technical decisions approved.
- [ ] Prisma Contract validation and migration review completed.
- [ ] Register, Login, Refresh, Logout and Me implemented to the documented API contract.
- [ ] Token lineage, transaction rollback and concurrent-refresh invariants verified against PostgreSQL.
- [ ] Protected requests reject revoked sessions; ownership checks prevent cross-user access.
- [ ] No plaintext password or refresh token persisted or logged.
- [ ] Test results and remaining risks recorded; documentation updated to reflect verified implementation.

**Next document:** [01 — Functional Specification (FSD)](fsd.md).
