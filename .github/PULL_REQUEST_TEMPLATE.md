## Summary

<!-- What does this PR do? Reference the Paperclip issue if applicable. -->

## Definition of Done

A change is **not done** until **all** of these hold:

- [ ] **Correct across the input space** — behavior verified at boundaries, edges, and the documented contract; happy path is not enough.
- [ ] **Clear** — names reveal intent; functions short and single-purpose; nesting flat; no hidden state or hidden side effects.
- [ ] **No new accidental complexity** — no speculative abstractions, no flags-for-the-future, no duplicated knowledge. (Coincidental similarity is not duplication.)
- [ ] **Error paths handled** — fails fast and loudly, never swallows errors, preserves invariants under failure, distinguishes expected from exceptional.
- [ ] **Boundary tests with behavior-level assertions** — tests check observable behavior, not implementation; each test has been seen to fail before being seen to pass.
- [ ] **Regression test for any bug fixed** — a permanent test that reproduces the bug, kept forever.
- [ ] **Green CI** — lint, typecheck, tests, build all pass on the change before merge.

## CI checklist

- [ ] Branch is rebased on the latest `main` (`git fetch origin && git rebase origin/main`)
- [ ] No secrets, credentials, or customer data in the diff

## Test plan

<!-- How was this change verified? List what you ran or tested. -->
