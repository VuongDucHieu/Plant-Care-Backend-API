# Plant Care — Prisma 8 RC Migration Safety Runbook

**Status:** Review only; commands are not executed by the author. **Environment:** PowerShell, pnpm, Docker Compose, PostgreSQL 17; project `prisma.config.ts` points to `./src/prisma/contract.prisma`.

## 1. What we verified from GitHub main

- `src/prisma/contract.prisma` currently defines **example User/Post** models with integer IDs; it is not the proposed authentication schema.
- `prisma.config.ts` uses `@prisma/cli-engine` and `@prisma/orm-postgres/config` (Prisma 8 RC toolchain).
- `compose.yml` binds Postgres to `127.0.0.1:${POSTGRES_PORT:-5434}:5432`, not the default 5432 host port.
- A prior local status reported a pending migration `20261122T1655_init_identity_plants` containing User/Post operations. This is a **prior user-local observation**, not re-verified from GitHub main.

## 2. Safety gates — stop on any mismatch

**Before changes:**

```powershell
pnpm exec prisma --version
pnpm exec prisma migration status
pnpm exec prisma db verify
```

Record output. Do not assume Prisma 7 CLI commands work in Prisma 8 RC. Do not run `db sign` to silence an unverified state.

**Inspect existing migrations and local DB:**

```powershell
Get-ChildItem migrations -Recurse
# Read the pending migration file and compare its operations to the intended schema.
```

For SQL inspection, use the actual environment credentials; do not paste secrets into docs. A PostgreSQL example that uses variables from your environment:

```powershell
# Run only after confirming env values are set in the shell.
'SELECT tablename FROM pg_tables WHERE schemaname = ''public'' ORDER BY tablename;' | docker compose -f compose.yml exec -T postgres psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB
```

If the shell has not loaded `.env` into `$env:*`, the above command needs adaptation. Do not treat an empty variable as proof of missing tables.

## 3. Contract review before emit

- Agree on field names, relation cardinality, token state semantics, delete policy and indexes.
- `id String @id @onCreate(uuid())` is the **previously diagnosed** replacement for an invalid `@default(uuid())` in this RC contract; still verify with the installed CLI.
- Self-relations, composite FKs, `temporal.CreatedAt`, enums and constraints need separate CLI validation; do not assume Prisma 7 syntax.
- Compare proposed schema to the actual GitHub main baseline and any uncommitted local changes before overwriting files.

## 4. Generate and inspect, then apply to isolated DB

```powershell
pnpm exec prisma contract emit
pnpm exec prisma migration status
```

If emit fails, stop and correct the specific contract diagnostic. After emit, inspect the generated migration SQL/operations **before** applying anything. Confirm exactly these logical entities: `User`, `Session`, `RefreshToken`, `Plant` — and **no accidental Post table**.

The exact Prisma 8 RC command to create/apply a migration must be taken from `pnpm exec prisma --help` and `pnpm exec prisma migration --help` in your installed version; this runbook intentionally does not invent a command. Prefer a disposable isolated DB for first apply. Never run `docker compose down -v` unless you explicitly approve deleting the named database volume and have confirmed backup requirements.

## 5. Verification after isolated apply

- Inspect actual tables, foreign keys, unique indexes and check constraints.
- Insert a test parent/child token and attempt a second child for the same parent: expect unique violation.
- Attempt cross-session parent/child: expect rejection by DB constraint if that enforcement was selected.
- Run integration tests for atomic consume, rollback, reuse, logout and concurrency.
- Record CLI versions, migration identifier, test results and any deviations in the PR/test evidence.

## 6. Failure handling

| Symptom | First investigation | Avoid |
|---|---|---|
| `SOURCE_LOAD_FAILED` | Read contract diagnostic and tool versions | Blindly re-running migration |
| UUID `@default` rejected | Check `@onCreate(uuid())` in current RC | Copying Prisma 7 examples |
| Pending migration creates Post | Inspect migration source/snapshot | Applying because filename says identity |
| DB verification marker missing | Determine actual migration/signing state | Signing without understanding state |
| Unique/FK mismatch | Inspect generated SQL and actual `pg_constraint` | Assuming schema declaration equals DB behavior |

## 7. Approval gate

Do not move to implementation until: contract emit succeeds, intended migration has been reviewed, isolated apply passes, constraints are observed, and critical integration tests have been specified. Mark each result as **verified** only after obtaining its actual output.
