# Code Review Rubric

**Standard:** Code Quality Standard — Correct, Clear, Simple, Tested, Bulletproof
**Priority order:** correctness > readability > simplicity > maintainability > performance
**Applies to:** every PR on Obsidian Liquid Neon and Mythos Writer.

---

## How to use this rubric

Every reviewer runs through each section below before approving. If any item fails, request changes — politely, with the rule and the why. When in doubt, the priority order above is the tiebreaker: correctness always wins.

---

## 1. Correctness

- Does the change handle the full input space, including the edge-case checklist below?
- Are error paths covered as carefully as the happy path?
- Does behavior hold at every documented boundary?
- For a theme: does it render correctly across all supported Obsidian versions and modes (light/dark)?
- "It seems to work" is not evidence. Verification must exist.

## 2. Clarity

- Could a new contributor understand each selector or function from its name alone?
- Is nesting flat? Are selectors and rules single-purpose?
- Do variable names reveal intent — no abbreviations that require context to decode?
- Are there hidden interactions between rules that would surprise the next editor?
- Is the WHY of non-obvious decisions captured (a comment on a constraint, not a description of the code)?

## 3. Simplicity

- Is any new complexity essential (the problem demands it) vs. accidental (we introduced it)?
- Cut the accidental. Every abstraction must justify itself with ≥ 2–3 real, present cases.
- No speculative abstractions, flags-for-the-future, or "in case we need it later" patterns.
- No duplicated knowledge (coincidental similarity is fine; duplicated invariant is not).

## 4. Tests

- Visual or functional verification exists for the changed behavior?
- Were checks seen to fail before they were seen to pass (for automated tests)?
- For any bug fixed: is a permanent regression note or test included?
- No checks commented out, no `.only` left in any test suite.

## 5. CI / Safety

- All automated CI checks green before requesting review?
- No new accidental coupling between theme layers?
- No secrets, credentials, or user data in the diff?
- Branch is current with `main`?

---

## Definition of Done (checklist form)

A change is **not done** until **all** of these hold:

- [ ] Correct across the input space — behavior verified at boundaries, edges, and the documented contract.
- [ ] Clear — names reveal intent; rules short and single-purpose; nesting flat; no hidden side effects.
- [ ] No new accidental complexity — no speculative abstractions, no flags-for-the-future, no duplicated knowledge.
- [ ] Error paths handled — fails safely, preserves invariants under failure.
- [ ] Boundary tests with behavior-level assertions — each check has been seen to fail before pass.
- [ ] Regression test for any bug fixed — permanent, kept forever.
- [ ] Green CI — all checks pass on the change before merge.

---

## Edge-case checklist (apply by default to every change)

When reviewing logic and style rules:

- Empty or absent values (no notes, no headings, no content)
- Single element vs. collection
- Null / absent / undefined (missing frontmatter, missing plugin data)
- Long text / very short text (overflow, truncation)
- Special characters and Unicode (especially in user-authored content)
- Light mode and dark mode
- Mobile and desktop layouts
- High-contrast / accessibility modes
- Nested structures at max depth

---

## Required testing techniques

| Technique | When to apply |
|---|---|
| **Boundary-value analysis** | Every threshold — test at, just below, and just above. |
| **Equivalence partitioning** | One representative per behavior class + the boundary between classes. |
| **Edge-case checklist** | Always — see section above. |
| **Negative / adversarial tests** | Invalid input handled safely; system sane when a plugin or data source is missing. |
| **Property-based testing** | Any code with mathematical properties: parsers, serializers, data-structure ops, round-trips. |
| **Fuzzing** | Any code that parses untrusted input: file formats, user-supplied data. |
| **Regression test for every bug** | Reproduce the bug in a permanent test before the fix; keep it forever. |

---

## Anti-patterns to refuse at review

- Long selectors, deep nesting, god objects, excessive coupling.
- Duplication of **knowledge** (duplicated invariant/logic — not coincidental structural similarity).
- Magic numbers and un-named literals.
- Premature optimization that costs clarity for no measured win.
- Speculative abstraction "in case we need it later" (rule of three: wait for the third case).
- Hidden side effects in apparently pure rules.
- Swallowed errors, empty catch blocks, vague catch-all rescues.
- Tests/checks that have never been seen to fail; commented-out tests.

---

## Definition of Done applied to bug fixes

Every bug fix MUST include:

1. A **record or test that reproduces the bug**, written before the fix.
2. The minimal fix that resolves it.
3. A short note referencing the incident — so future maintainers don't "simplify away" a load-bearing workaround.

The bug must never silently return.

---

## Related

- Contributing guide: [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- PR template: [`.github/pull_request_template.md`](../.github/pull_request_template.md)
