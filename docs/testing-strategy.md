# Testing Strategy — Obsidian Liquid Neon

> Canonical reference: [Code Quality Standard §3 + §7](/SKY/issues/SKY-356#document-code-quality-standard).
> This doc translates those requirements into concrete Obsidian Liquid Neon practice.
> Read this before writing or reviewing any test.

This repository currently consists of a CSS theme (`theme/Liquid-Neon/`) and a plugin placeholder
(`plugin/Liquid-Neon-Companion/`). Most of the testing strategy below applies to both the theme and
the companion plugin once it ships TypeScript. Where automated tooling does not yet exist, this doc
notes the follow-up subtask tracking it and describes what testing will look like once tooling lands.

---

## 1. Pyramid Shape

```
        ┌─────────────┐
        │   Visual    │  ← few; critical visual journeys in real Obsidian
        ├─────────────┤
        │   Visual    │  ← visual regression snapshots (automated, browser)
        │ Regression  │
        ├─────────────┴──────────────────────────────────────┐
        │             Unit / Static                          │  ← CSS lint, token validation,
        └────────────────────────────────────────────────────┘    plugin unit tests (TypeScript)
```

| Layer | Runner | Location | Speed | Count goal |
|---|---|---|---|---|
| Unit / Static | Stylelint + (future) Vitest | `theme/Liquid-Neon/`, `plugin/Liquid-Neon-Companion/` | < 10 s | Many |
| Visual regression | (future) Playwright / Percy | `tests/visual/` (to be created) | Minutes | Moderate — one per significant component |
| Manual E2E | Human verification in Obsidian | — | Session | Few — install + render + light/dark |

**Anti-pattern to refuse:** relying solely on "it looks fine on my machine." Visual regressions in themes are silent — a CSS change can make every heading unreadable on a light canvas without breaking any lint rule. The visual regression layer exists to catch what static analysis cannot.

---

## 2. What a Good Test Looks Like

**For CSS / theme tests:**

- **Focused** — one property or token per assertion.
- **Independent** — tests do not depend on browser state left by a previous test.
- **Deterministic** — pixel snapshots must be taken against a fixed Obsidian version and a fixed system font rendering stack.
- **Readable** — test names describe visual behavior: "neon-cyan heading has contrast ratio ≥ 4.5:1 on dark canvas", not "test heading color".
- **Behavior-not-implementation** — test the rendered output (computed colour, contrast ratio, visibility), not which CSS file defines it.

**For plugin TypeScript tests (once the plugin ships):**

Follow the same Arrange-Act-Assert pattern used in Mythos Writer — see the companion repo's `docs/testing-strategy.md` for worked examples.

---

## 3. Default Techniques on Every Change

### 3.1 Boundary-Value Analysis

For a CSS theme, boundary-value concerns are primarily numerical — slider ranges, contrast ratios, border widths.

**The `ln-softness-level` slider (0–100 range in `theme/Liquid-Neon/tokens.css`):**

Test at: 0 (minimum, crisp/high-contrast), 50 (default), 100 (maximum, soft/glassy), and — once automated tooling exists — at −1 and 101 to confirm the Obsidian Style Settings plugin clamps gracefully.

```css
/* Planned unit test (postcss-based, follow-up subtask):
   Verify --ln-softness-level: 0 does not drop contrast below WCAG AA */
```

**Token completeness:** every token referenced in `theme.css` must be defined in `tokens.css`. Missing tokens fall back to browser defaults silently — a boundary condition that is easy to miss.

### 3.2 Equivalence Partitioning

The Liquid Neon theme operates across three distinct behavior classes:

1. **Dark mode** (primary target) — deep black canvas, neon accents.
2. **Light mode** — if supported: lighter canvas, adapted accents.
3. **High-contrast / forced-colors mode** — operating system accessibility override.

Test one representative scenario per class. Do not treat "it looks fine in dark mode" as evidence that light mode works.

### 3.3 Edge-Case Checklist

For every theme or plugin change, check:

- [ ] Long titles / file names (> 80 characters) do not overflow or break layout
- [ ] Empty vault (no notes, no folders) — sidebar and empty states render cleanly
- [ ] Note with only a single character — headings, body text scale correctly
- [ ] Unicode and emoji in note titles and body text — no layout shift or glyph escape
- [ ] Obsidian in reading mode vs. editing mode — theme applies correctly to both
- [ ] Zoom levels 80%, 100%, 125% — neon frames and glows do not break
- [ ] Dark mode toggle mid-session — theme applies instantly without flash
- [ ] Mobile (Obsidian mobile app) — layout adapts without horizontal scroll

### 3.4 Negative and Adversarial Tests

- **Unrecognised Obsidian internal class names:** Obsidian's internal DOM changes between releases. When a selector targets an undocumented class, the worst failure mode is silent (styles just don't apply). The adversarial check: after each Obsidian version bump, render the theme and assert that the expected elements are styled (contrast, visibility).
- **Conflicting plugin CSS:** themes share the DOM with community plugins. Verify that Liquid Neon's specificity does not inadvertently override plugin UI.
- **Missing token fallback:** if a CSS custom property is not defined, the fallback must be visually acceptable, not invisible text on invisible background.

---

## 4. Property-Based Testing

**When relevant:**

Property-based testing applies primarily to the companion plugin once it ships TypeScript logic (parsers, serializers, data transformations). CSS itself does not have parseable properties suitable for property-based testing with current tooling.

**Status:** No property-based framework is installed. Tooling selection is tracked as a follow-up subtask of [SKY-356](/SKY/issues/SKY-356). Once the plugin has TypeScript logic, fast-check is the recommended candidate.

**What it will look like** (illustrative, for future plugin code):

```ts
// plugin/Liquid-Neon-Companion/tests/token-parser.test.ts
import fc from 'fast-check';
import { parseTokenValue, serializeTokenValue } from '../src/token-parser';

it('round-trips any valid CSS token value', () => {
  fc.assert(fc.property(fc.string(), (raw) => {
    const parsed = parseTokenValue(raw);
    if (parsed.ok) {
      expect(serializeTokenValue(parsed.value)).toBe(raw.trim());
    }
  }));
});
```

---

## 5. Fuzzing

**When required:** Any plugin code that reads untrusted input — vault `.md` file content, Obsidian API event payloads, user-supplied configuration values.

**Status:** No fuzzing framework is installed. Adding fuzz targets is tracked as a follow-up subtask of [SKY-356](/SKY/issues/SKY-356). The CSS theme itself does not parse untrusted input, so fuzzing is not immediately required. It becomes required when the companion plugin begins parsing vault content.

**When tooling is in place:**

1. Create `plugin/Liquid-Neon-Companion/fuzz/<target>.fuzz.ts`.
2. Accept a `Buffer` and pass it to the parser under test.
3. Assert the parser either returns a valid result or throws a typed error — never crashes the plugin or hangs Obsidian.
4. Add the target to CI.

**Triaging:**

- Crash → file a bug, write a reproducing unit test, fix before merge.
- Hang (> 10 s) → treat as a crash.
- Unexpected output → add to equivalence partition tests, fix.

---

## 6. Regression Discipline

**Rule:** Every fixed bug — whether a visual defect or a plugin logic error — gets a permanent, named regression test. Write the failing test **before** the fix.

**For visual bugs:** Take a snapshot of the broken state (screenshot with the defect visible) and store it in `tests/visual/baselines/regressions/`. When the fix lands, update the snapshot to the corrected state. The before/after screenshots live in the PR description.

**For plugin logic bugs:** Write a failing Vitest unit test that reproduces the bug, commit it, then apply the fix in a separate commit.

**Example commit sequence:**

```
test(SKY-NNN): add regression for heading overflow on long titles

Reproduces: a note title with 90+ chars caused the heading neon frame
to overflow the sidebar. Snapshot of the broken state included.
```

```
fix(SKY-NNN): clamp heading overflow with text-overflow: ellipsis
```

The regression test stays in the suite forever. The bug must never silently return.

---

## 7. Coverage Policy

**Coverage is a floor and a flashlight — not a target.**

For a CSS theme, "coverage" means: every significant UI surface (headings, body text, sidebar, graph view, modals, settings panel) has at least one visual assertion. There is no numeric line-coverage target for CSS.

**For the companion plugin (TypeScript):**

Once the plugin ships logic, use Vitest's built-in coverage (`--coverage`) as a flashlight to find untested code paths. The honest measure of suite effectiveness is mutation testing.

**Mutation testing:**

[Stryker](https://stryker-mutator.io/) is the recommended mutation testing tool for TypeScript plugin code. Configuration is tracked as a follow-up subtask of [SKY-356](/SKY/issues/SKY-356). Run Stryker periodically when auditing a module's test suite, not on every PR.

**CSS coverage:**

The equivalent of mutation testing for CSS is checking contrast ratios and computed styles programmatically — not just that a rule applies, but that it produces the correct visual output. Tools: axe-core (accessibility), postcss-analyze (token usage).

---

## 8. No Test You Haven't Seen Fail

**Rule:** Before committing a new test, you must watch it fail.

**For visual regression tests:**

1. Write the new snapshot test.
2. Temporarily apply a visible CSS change (e.g., set `--ln-cyan` to red).
3. Run the snapshot test — confirm it fails and the diff clearly shows the change.
4. Revert the temporary change.
5. Run again — confirm it passes.

**For plugin unit tests:**

1. Write the test.
2. Comment out the implementation or return a wrong value.
3. Confirm the test fails with a meaningful, specific error.
4. Restore the implementation.
5. Confirm the test passes.

**Why this matters for CSS themes especially:** It is easy to write a snapshot test that always passes because the baseline was taken from a broken state. Always introduce a deliberate failure to prove the test is sensitive to the thing it claims to guard.

---

## Quick Reference: Running Tests

```bash
# CSS lint (once Stylelint is configured — follow-up subtask SKY-356)
npx stylelint "theme/**/*.css"

# Plugin unit tests (once plugin has TypeScript + Vitest)
cd plugin/Liquid-Neon-Companion && npm test

# Visual regression (once Playwright is configured — follow-up subtask SKY-356)
npx playwright test tests/visual/

# Manual verification checklist (current primary method)
# See: README.md §Obsidian Community-Theme Submission Checklist
```

**Manual verification is the current primary QA method.** Before every PR that changes CSS:

1. Install the theme in a local Obsidian vault.
2. Open a note with typical content (headings, body text, code block, table).
3. Verify in dark mode.
4. Verify at zoom 80%, 100%, 125%.
5. Check contrast with the browser devtools accessibility panel.
6. Screenshot the result and attach to the PR.
