## Summary

<!-- What does this PR do? Reference the Paperclip issue if applicable (e.g. Refs: SKY-123). -->

## Definition of Done

_Every change must satisfy all items before merge. Reviewer confirms these hold._

- [ ] **Correct across the input space** — behavior verified at boundaries, edges, and the documented contract; happy path is not enough.
- [ ] **Clear** — names reveal intent; selectors/variables/functions short and single-purpose; nesting flat; no hidden side effects.
- [ ] **No new accidental complexity** — no speculative abstractions, no flags-for-the-future, no duplicated knowledge.
- [ ] **Error paths handled** — fails safely; no silent mismatches between theme layer and Obsidian version contract.
- [ ] **Boundary tests with behavior-level assertions** — visual or functional tests check observable behavior, not implementation details.
- [ ] **Regression test for any bug fixed** — a permanent record/test that the bug is fixed, kept forever.
- [ ] **Green CI** — lint, build, and any automated checks all pass on this branch before merge.

> Full rubric: [docs/code-review-rubric.md](../docs/code-review-rubric.md) · Standard: [Code Quality Standard](https://github.com/SkyyPlayz/Obsidian-Liquid-Neon/blob/main/Plans/)

## Pre-merge checklist

- [ ] Branch is rebased on the latest `main`
- [ ] All automated CI checks pass
- [ ] No secrets, credentials, or user data in the diff
- [ ] Theme renders correctly in Obsidian (light + dark mode if applicable)

## Test plan

<!-- How was this change verified? What edge cases / Obsidian versions were tested? -->
