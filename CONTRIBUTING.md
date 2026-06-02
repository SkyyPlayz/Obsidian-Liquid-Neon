# Contributing to Obsidian Liquid Neon

## Code Quality Standard

Every change on this repo must meet the **Code Quality Standard — Correct, Clear, Simple, Tested, Bulletproof**.

- **Reviewers:** run the [Code Review Rubric](docs/code-review-rubric.md) on every PR.
- **Authors:** verify the Definition of Done checklist in the PR template before requesting review.
- **Priority order when qualities conflict:** correctness > readability > simplicity > maintainability > performance.

Full details: [`docs/code-review-rubric.md`](docs/code-review-rubric.md)

---

## Merge Policy

All changes to `main` must go through a pull request that passes every required CI check **and** is up to date with `main` at the time of merge.

### Branch must be up to date

Before merging, your branch must include every commit currently on `main`. If another PR lands while yours is in review, rebase your branch:

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### No force-pushing to main

`main` is a protected branch. Direct pushes and force-pushes are blocked.

## Branch naming

Use descriptive branch names scoped to the issue:

```
fix/sky-123-short-description
feat/sky-456-short-description
chore/sky-789-short-description
```

## Commit messages

Write imperative, present-tense summaries. Reference the Paperclip issue identifier in the commit body or footer:

```
fix: correct heading contrast in dark mode

Refs: SKY-456
```
