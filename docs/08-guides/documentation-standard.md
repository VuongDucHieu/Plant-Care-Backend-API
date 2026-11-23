# Plant Care — Documentation Standard

## Feature documentation contract

Each feature should make six questions answerable:

1. **Why?** User/business problem, goals, boundaries and measurable acceptance.
2. **What?** Actors, preconditions, functional requirements, business rules, scenarios and error behavior.
3. **How?** Component/sequence diagrams, data model, API contract and alternative designs.
4. **Risks?** Threats, failure modes, concurrency/data-integrity assumptions, likelihood × impact and mitigation.
5. **Tests?** Requirement-linked unit, integration, contract, security and UAT cases with expected outcomes.
6. **Evidence?** Code path, command output, test report, PR/commit and unresolved gaps.

## Required metadata

- Status: Draft / Proposed / Accepted / Implemented / Deprecated.
- Owner/reviewer (if known); updated date; scope; source of truth.
- Links to upstream requirements, related ADRs, code and test cases.

`Accepted` means the design decision is approved; it does **not** prove code exists. `Implemented` requires source evidence, and `Verified` requires actual test/runtime evidence.

## Feature folder template

```text
docs/03-features/<feature>/
  README.md         # navigation and current status
  fsd.md            # behavior, rules, acceptance criteria
  use-cases.md      # main, alternative and exception flows
  design.md         # diagrams, alternatives, trade-offs, risks
  test-cases.md     # requirement-linked tests and evidence
```

Split files only when the feature is large enough; do not create empty placeholder files.

## Requirement traceability example

| Requirement | Design | Test | Evidence | Status |
|---|---|---|---|---|
| AUTH-03: rotate once | conditional update + transaction | TC-AUTH-03 concurrent refresh | Pending integration test | Designed |

## Error investigation template

```markdown
### Symptom
What failed? Include exact command, environment and output.
### Expected vs actual
What should have happened? What happened instead?
### Hypotheses and evidence
What assumptions are testable? What did CLI/source/database show?
### Root cause
Verified explanation, not a guess.
### Fix and regression prevention
Smallest correction, automated test and docs/ADR update.
```

Example: Prisma 8 RC CLI rejected `@default(uuid())` because client-generated UUIDs require `@onCreate(uuid())`; the CLI diagnostic is the evidence. A corrected contract is only verified after `pnpm exec prisma contract emit` succeeds.

## Review checklist

- [ ] Newcomer can find the document from `docs/README.md`.
- [ ] Requirements and current implementation are not conflated.
- [ ] Diagrams agree with schema and source.
- [ ] Alternatives and rejected options are documented.
- [ ] Risk mitigations have corresponding test cases.
- [ ] Commands are verified against the installed toolchain.
- [ ] Links and file paths resolve.
- [ ] Changes do not silently remove historical decisions.
