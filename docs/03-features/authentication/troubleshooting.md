# Authentication — Troubleshooting and Design Corrections

**Purpose:** Capture durable causes and verification steps, not a diary of every command. Do not paste credentials or raw tokens.

## Case 001 — Prisma 8 RC rejects `@default(uuid())`

**Symptom:** `pnpm exec prisma contract emit` reports `PSL_GENERATOR_IN_DEFAULT` for User/Session/Plant IDs.

**Root cause:** Prisma 8 RC's `@default` represents a database default; client-generated `uuid()` must use `@onCreate(uuid())`. Earlier advice reused older Prisma syntax without verifying against the installed CLI.

**Evidence:** User's actual Prisma CLI diagnostics at `src/prisma/contract.prisma` lines 4, 16, 30.

**Correction:** Use `id String @id @onCreate(uuid())` for client-generated UUID; run `pnpm exec prisma contract emit` again.

**Prevention:** Pin Prisma 8 RC versions; check version-specific syntax with the project CLI before proposing migrations; distinguish draft contract from verified contract.

## Case 002 — Pending migration does not match its name

**Symptom:** `20261122T1655_init_identity_plants` is pending, but its `migration.ts` creates sample `User` and `Post` rather than Identity/Plant tables.

**Root cause:** Migration name is not proof of operations; it was generated from an earlier sample contract.

**Correction:** Do not apply this migration. Inspect status, snapshots and operations; follow the Prisma 8 RC migration regeneration procedure on a disposable development database. Never run `down -v` without confirming the volume contains no valuable data.

**Prevention:** Review `migration.ts` and `ops.json` before applying; check expected tables/constraints after migration.

## Future incident template

```text
ID / date:
Expected behavior:
Observed behavior and exact error:
Environment and version:
Hypotheses considered:
Evidence that confirmed root cause:
Minimal fix:
Regression test:
Documentation/ADR affected:
```
