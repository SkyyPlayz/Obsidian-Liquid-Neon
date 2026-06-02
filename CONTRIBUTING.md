# Contributing to Obsidian Liquid Neon

## Code quality standard

Every code change must satisfy the [Code Review Rubric](docs/code-review-rubric.md) before merge.
The rubric is derived from the [company Code Quality Standard](https://github.com/SkyyPlayz/Mythos-Writer/blob/main/plans/ProjectGoalOverView/13-Code-Quality.md) (correctness → clarity → simplicity → maintainability → performance).

## Merge Policy

All changes to `main` must go through a pull request. No direct pushes.

### Branch must be up to date

Before merging, your branch must include every commit currently on `main`:

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

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
fix: correct contrast ratio on active tab border

Refs: SKY-123
```
