# Code Review Rubric

> **Source of truth:** [Code Quality Standard — Correct, Clear, Simple, Tested, Bulletproof](https://github.com/SkyyPlayz/Mythos-Writer/blob/main/plans/ProjectGoalOverView/13-Code-Quality.md)
> Read the full standard before reviewing. This rubric is the section-6 excerpt reviewers run on every PR.

---

## How to use this rubric

Before approving any PR, confirm each item below. If any item fails, request changes — politely, with the rule and the why.

---

## Correctness

- Does the change handle the full input space, including the edge-case checklist?
- Are error paths covered as carefully as the happy path?

## Clarity

- Could a new engineer understand each function from its name + signature alone?
- Is nesting flat? Are functions single-purpose and short enough to hold in mind?

## Simplicity

- Is any new complexity essential (problem) vs. accidental (us)? Cut the accidental.
- Are abstractions justified by ≥ 2–3 real cases, or speculative?

## Tests

- Boundary tests present? Behavior-level assertions (not implementation-coupled)?
- For any fixed bug: permanent regression test included?
- For parsers/serializers/untrusted input: property-based or fuzzing in place?

## CI / Safety

- Lint, typecheck, tests, build all green?
- No new accidental coupling, hidden state, swallowed errors?

---

## Anti-patterns — refuse at review

The following patterns are explicitly banned. Request changes when any is present:

- Long functions, deep nesting, god objects, excessive coupling.
- Duplication of **knowledge** (vs. coincidental similarity — leave that alone).
- Magic numbers/strings; un-named literals.
- Premature optimization that costs clarity for no measured win.
- Premature/speculative abstraction "in case we need it later" (rule of three).
- Mutable global state, hidden side effects in pure-looking functions.
- Swallowed errors, empty catch blocks, vague catch-all rescues.
- Test coupled to implementation; test that has never been seen to fail; commented-out tests; `.only` left in suite.

---

## Definition of Done (reference)

A change is **not done** until all of these hold:

- [ ] **Correct across the input space** — behavior verified at boundaries, edges, and the documented contract; happy path is not enough.
- [ ] **Clear** — names reveal intent; functions short and single-purpose; nesting flat; no hidden state or hidden side effects.
- [ ] **No new accidental complexity** — no speculative abstractions, no flags-for-the-future, no duplicated knowledge. (Coincidental similarity is not duplication.)
- [ ] **Error paths handled** — fails fast and loudly, never swallows errors, preserves invariants under failure, distinguishes expected from exceptional.
- [ ] **Boundary tests with behavior-level assertions** — tests check observable behavior, not implementation; each test has been seen to fail before being seen to pass.
- [ ] **Regression test for any bug fixed** — a permanent test that reproduces the bug, kept forever.
- [ ] **Green CI** — lint, typecheck, tests, build all pass on the change before merge.

---

## Priority order (when qualities conflict)

1. **Correctness** — produces the right result across the whole input space.
2. **Readability / clarity** — the next reader can predict behavior by reading.
3. **Simplicity** — fight accidental complexity at every change.
4. **Maintainability** — explicit interfaces, comprehensive regression tests.
5. **Performance** — algorithmic choices at design time; micro-optimization only after profiling.
