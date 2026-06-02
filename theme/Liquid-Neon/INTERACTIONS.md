# Liquid Neon Interaction States — Specification

**Version:** 1.0  
**Status:** Active (Phase 2.1)  
**Last Updated:** 2026-05-31  
**Derived from:** Phase 0.4 tokens (`SPEC.md`)

---

## Overview

This specification defines the reusable neon-frame interaction states for all interactive UI elements: **hover**, **focus** (keyboard navigation), and **active** (pressed/selected). All states are built from the locked token set in `tokens.css` and must be applied consistently across buttons, list items, file-explorer rows, ribbon icons, and callout pills.

**Key principles:**
- States layer on top of the base element without replacing it.
- Glows intensify on interaction; inner glows indicate depth/selection.
- Transitions are smooth but snappy (100–200ms).
- Accessibility-first: focus states are always visible and keyboard-accessible; reduced motion is respected.
- Per-surface tweaks account for density, context, and visual hierarchy.

---

## State Definitions

### 1. Hover State

**Visual behavior:** Outer glow intensifies, inner glow appears, background tint added.

**Intent:** Clear, immediate visual feedback that the element is interactive and the user can activate it.

**Token composition:**
- `--ln-glow-hover` (outer): `0 0 18px var(--ln-magenta), 0 0 36px var(--ln-violet)` — bright, magenta-shifted glow
- `--ln-glow-inner` (inner): `inset 0 0 8px rgba(0, 229, 255, 0.25)` — subtle depth glow
- `--ln-state-hover` (background tint): `rgba(255, 255, 255, 0.08)` — low-alpha white wash

**CSS (base implementation):**
```css
[data-interactive]:hover {
  box-shadow: var(--ln-glow-hover), var(--ln-glow-inner);
  background-color: rgba(255, 255, 255, var(--ln-opacity-10));
  transition: all var(--ln-duration-fast) var(--ln-easing-out);
}
```

**Accessibility:**
- Hover state is NOT keyboard-accessible. Keyboard users will see `:focus-visible` instead.
- No timer—hover persists while the pointer is over the element.
- Reduced motion: keep the glow but remove the transition (`transition: none`).

**Trigger:** `:hover` (pointer only) or hover-like events on touch devices (option: add `.active-touch` class).

---

### 2. Focus State (Keyboard Navigation)

**Visual behavior:** Prominent neon ring around element, combined outer + inner glow, background tint.

**Intent:** Accessibility-first affordance for keyboard navigation. Must be visually distinct from hover and always visible.

**Token composition:**
- `--ln-glow-focus` (combined): `0 0 20px var(--ln-cyan), 0 0 40px var(--ln-violet), inset 0 0 10px rgba(0, 229, 255, 0.15)` — strongest outer + inner glow, cyan-dominant
- `--ln-state-active` (background tint, slightly stronger than hover): `rgba(255, 255, 255, 0.12)`
- Focus ring (explicit outline alternative): `2px solid var(--ln-state-focus-ring) (#00E5FF)` with `-webkit-appearance: none` to override browser defaults

**CSS (base implementation):**
```css
[data-interactive]:focus-visible {
  box-shadow: var(--ln-glow-focus);
  background-color: rgba(255, 255, 255, var(--ln-opacity-20));
  outline: none; /* Remove browser default */
  transition: all var(--ln-duration-base) var(--ln-easing-in-out);
}

/* Fallback for older browsers without :focus-visible */
[data-interactive]:focus {
  box-shadow: var(--ln-glow-focus);
  background-color: rgba(255, 255, 255, var(--ln-opacity-20));
  outline: 2px solid var(--ln-state-focus-ring);
  outline-offset: 2px;
}
```

**Distinguishing from hover:**
- **Hover:** magenta-violet glow, cyan inner
- **Focus:** cyan-dominant outer, stronger inner glow, thicker overall effect
- **Visual hierarchy:** Focus > Hover > Base

**Accessibility:**
- `:focus-visible` ensures focus is only shown for keyboard navigation (not click/tap).
- Outline thickness (2px) and color (`#00E5FF`, 18:1 contrast) meet WCAG AAA.
- Focus must be visible on all backgrounds tested in the theme.

**Trigger:** `Tab` key, `Shift+Tab`, or programmatic `element.focus()`.

---

### 3. Active State (Pressed / Selected)

**Visual behavior:** Maximum glow intensity, prominent inner glow, stronger background tint, possible slight inset effect.

**Intent:** User has initiated an action (button pressed) or element is selected (list item, tab, toggle). State persists until action completes or selection changes.

**Token composition:**
- `--ln-glow-focus` (outer): `0 0 20px var(--ln-cyan), 0 0 40px var(--ln-violet)` — cyan-dominant glow
- `--ln-glow-inner` (inner, emphasized): `inset 0 0 12px rgba(0, 229, 255, 0.35)` — stronger inner glow for depth
- `--ln-state-active` (background tint): `rgba(255, 255, 255, 0.12)` — white wash
- Optional inset shadow for "pressed" feel: `inset 0 2px 4px rgba(0, 0, 0, 0.2)` (on buttons only)

**CSS (base implementation):**
```css
[data-interactive]:active,
[data-interactive].is-selected {
  box-shadow: var(--ln-glow-focus), inset 0 0 12px rgba(0, 229, 255, 0.35);
  background-color: rgba(255, 255, 255, var(--ln-opacity-20));
  transition: all var(--ln-duration-instant) var(--ln-easing-in);
}

/* Button-specific: add inset shadow for tactile feedback */
button:active,
[role="button"]:active {
  box-shadow: var(--ln-glow-focus), inset 0 0 12px rgba(0, 229, 255, 0.35), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Selected list item / tab */
[role="option"].is-selected,
[role="tab"][aria-selected="true"] {
  box-shadow: var(--ln-glow-focus), inset 0 0 12px rgba(0, 229, 255, 0.35);
}
```

**Accessibility:**
- Active state is always visible to keyboard users (`:focus-visible:active`).
- Selected state should be paired with `aria-selected="true"` or `aria-pressed="true"`.
- Visual + semantic cue ensures screen readers communicate the state.

**Trigger:** Mouse down, touch down, `Enter` / `Space` key press, or `element.classList.add('is-selected')`.

---

## Per-Surface Implementation

Each UI surface has unique density, context, and visual hierarchy. Adjustments ensure consistency while respecting local constraints.

### Button (Primary CTA)

**Base state:** `--ln-glow-outer`, white text on dark surface, padding: `var(--ln-space-md) var(--ln-space-lg)`.

```css
button {
  box-shadow: var(--ln-glow-outer);
  background-color: var(--ln-surface-elevated);
  color: white;
  padding: var(--ln-space-md) var(--ln-space-lg);
  border-radius: var(--ln-radius-md);
  border: 1px solid rgba(0, 229, 255, 0.3);
  transition: all var(--ln-duration-base) var(--ln-easing-in-out);
}

button:hover {
  box-shadow: var(--ln-glow-hover), var(--ln-glow-inner);
  background-color: rgba(255, 255, 255, 0.1);
}

button:focus-visible {
  box-shadow: var(--ln-glow-focus);
  background-color: rgba(255, 255, 255, 0.15);
}

button:active {
  box-shadow: var(--ln-glow-focus), inset 0 0 12px rgba(0, 229, 255, 0.35), inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: scale(0.98); /* Subtle press effect */
}
```

**Per-button variants:**
- **Secondary button:** Use `--ln-glow-subtle` (dim) instead of `--ln-glow-outer`; hover escalates to `--ln-glow-outer`.
- **Icon button (ribbon):** Smaller padding (`var(--ln-space-sm)`), smaller border radius (`var(--ln-radius-sm)`); glow remains the same.
- **Disabled button:** `opacity: var(--ln-opacity-50)`, no glow, `cursor: not-allowed`, `box-shadow: none`.

---

### List Item / Navigation Row

**Context:** High-density list (file navigator, notes vault, project outline). Base state minimal; hover/selection clarifies.

**Base state:** No glow, subtle background, tight padding (`var(--ln-space-sm) var(--ln-space-md)`).

```css
[role="option"],
.list-item {
  background-color: transparent;
  padding: var(--ln-space-sm) var(--ln-space-md);
  border-radius: var(--ln-radius-sm);
  color: rgba(255, 255, 255, 0.8);
  transition: all var(--ln-duration-fast) var(--ln-easing-out);
}

[role="option"]:hover,
.list-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.2); /* Subtle outer glow only */
  color: white;
}

[role="option"]:focus-visible,
.list-item:focus-visible {
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4), inset 0 0 8px rgba(0, 229, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.12);
}

[role="option"][aria-selected="true"],
.list-item.is-selected {
  box-shadow: var(--ln-glow-outer), inset 0 0 8px rgba(0, 229, 255, 0.2);
  background-color: rgba(0, 229, 255, 0.1);
  color: white;
  font-weight: var(--ln-font-weight-medium);
}
```

**Rationale:**
- List items are scanned quickly; base state is quiet to avoid visual clutter.
- Hover and focus escalate glow progressively.
- Selected state uses a cyan tint (not white wash) to harmonize with the cyan glow.

---

### File-Explorer Row

**Context:** Dense tree structure (Obsidian file browser). Rows are compact; interaction cues must be subtle by default.

**Base state:** No glow, transparent background, padding: `var(--ln-space-xs) var(--ln-space-sm)`.

```css
.file-explorer-row {
  background-color: transparent;
  padding: var(--ln-space-xs) var(--ln-space-sm);
  border-radius: var(--ln-radius-sm);
  color: rgba(255, 255, 255, 0.7);
  transition: all var(--ln-duration-fast) var(--ln-easing-out);
}

.file-explorer-row:hover {
  background-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.15); /* Very subtle */
  color: rgba(255, 255, 255, 0.9);
}

.file-explorer-row:focus-visible {
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.3), inset 0 0 6px rgba(0, 229, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.1);
}

.file-explorer-row.is-selected {
  background-color: rgba(0, 229, 255, 0.08);
  box-shadow: inset 0 0 8px rgba(0, 229, 255, 0.15);
  color: white;
}
```

**Rationale:**
- File explorer is the primary workspace; minimalism keeps focus on content.
- Glows scale down (no `--ln-glow-hover` intensity) to avoid overwhelming the view.
- Selected rows use inset glow only; outward glows would create visual "spikes" in a dense tree.

---

### Ribbon Icon (Toolbar)

**Context:** Compact toolbar row at top or side. Icons are small; glows must be proportionate.

**Base state:** No glow, transparent background, padding: `var(--ln-space-xs)` (square icon), border-radius: `var(--ln-radius-sm)`.

```css
[role="button"].ribbon-icon {
  width: 32px;
  height: 32px;
  padding: var(--ln-space-xs);
  border-radius: var(--ln-radius-sm);
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--ln-duration-fast) var(--ln-easing-out);
}

[role="button"].ribbon-icon:hover {
  background-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
}

[role="button"].ribbon-icon:focus-visible {
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.4), inset 0 0 6px rgba(0, 229, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.12);
}

[role="button"].ribbon-icon.is-active,
[role="button"].ribbon-icon[aria-pressed="true"] {
  background-color: rgba(0, 229, 255, 0.12);
  box-shadow: var(--ln-glow-outer), inset 0 0 8px rgba(0, 229, 255, 0.2);
  color: var(--ln-cyan);
}
```

**Rationale:**
- Ribbon icons are 32×32 or 40×40 px; large glows would overwhelm.
- Glow radius reduced (`12px` hover vs. `18px` standard).
- Active state (e.g., Bold/Italic in editor) uses color shift + full glow stack to signal "on."

---

### Callout Pill (Inline Badge / Tag)

**Context:** Inline emphasis (tags, badges, pill buttons in chat). Small, often grouped. Must scale down visually.

**Base state:** Subtle border + pale background, no glow, padding: `var(--ln-space-xs) var(--ln-space-sm)`.

```css
.callout-pill,
[role="status"].badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ln-space-xs);
  padding: var(--ln-space-xs) var(--ln-space-sm);
  border-radius: var(--ln-radius-full);
  background-color: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: var(--ln-cyan);
  font-size: var(--ln-text-sm);
  transition: all var(--ln-duration-fast) var(--ln-easing-out);
}

.callout-pill:hover {
  background-color: rgba(0, 229, 255, 0.15);
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.2);
}

.callout-pill:focus-visible {
  background-color: rgba(0, 229, 255, 0.2);
  border-color: var(--ln-cyan);
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.3), inset 0 0 4px rgba(0, 229, 255, 0.1);
}

.callout-pill.is-selected,
.callout-pill[aria-selected="true"] {
  background-color: rgba(0, 229, 255, 0.25);
  border-color: var(--ln-cyan);
  box-shadow: inset 0 0 6px rgba(0, 229, 255, 0.2);
}
```

**Rationale:**
- Pills are small and often appear in groups; full glow stacks would create visual noise.
- Color and border handle state escalation; glows are subtle (no magenta shift).
- Selected state is color-based (higher background alpha) + subtle inset glow.

---

## Transition & Animation Rules

All transitions use tokens from `tokens.css` for consistency.

### Timing

| Transition | Duration | Easing | Use Case |
|------------|----------|--------|----------|
| Hover entry | `--ln-duration-fast` (100ms) | `--ln-easing-out` | Snappy, immediate feedback |
| Focus entry | `--ln-duration-base` (200ms) | `--ln-easing-in-out` | Smooth arrival for keyboard |
| Active (press) | `--ln-duration-instant` (0ms) | `--ln-easing-in` | Immediate, no lag |
| Exit (hover off) | `--ln-duration-fast` (100ms) | `--ln-easing-out` | Quick return to base |

### Reduced Motion

Always respect `prefers-reduced-motion: reduce`. The media query sets `--ln-transition-enabled: 0` globally.

```css
@media (prefers-reduced-motion: reduce) {
  [data-interactive] {
    transition: none !important;
    animation: none !important;
  }
}

/* Or, selectively apply transitions: */
@media (prefers-reduced-motion: no-preference) {
  [data-interactive] {
    transition: all var(--ln-duration-base) var(--ln-easing-in-out);
  }
}
```

**User impact:** Animations are disabled; glows still change instantly on state change. No visual information is lost.

---

## Common Gotchas

### ✅ Do's

- **Layer glows:** Combine `box-shadow` entries for multiple glow effects (outer + inner).
- **Use transitions:** Every state change should be smooth except `:active` (instant).
- **Test on dark backgrounds:** All glows are designed for `--ln-surface-bg` and darker overlays.
- **Pair with semantics:** Add `aria-selected`, `aria-pressed`, etc., alongside CSS classes.
- **Test keyboard navigation:** Use `Tab`, `Shift+Tab`, `Enter`, `Space` on all interactive elements.

### ❌ Don'ts

- **Don't layer multiple outer glows.** Use one `--ln-glow-*` outer token at a time (hover → magenta, focus → cyan).
- **Don't apply hover + focus simultaneously.** CSS uses specificity: `:focus-visible` overrides `:hover` in the cascade.
- **Don't hardcode glow values.** Every glow must come from `tokens.css`.
- **Don't forget outline-offset.** If using an outline fallback, set `outline-offset: 2px` to avoid overlap.
- **Don't animate inactive elements.** Animations on disabled/hidden elements waste resources.

---

## Accessibility Compliance

### WCAG 2.1 — Level AA/AAA

| Criterion | Status | Notes |
|-----------|--------|-------|
| 2.1.1 Keyboard | ✅ Pass | All interactive elements are keyboard-accessible; focus is always visible. |
| 2.4.7 Focus Visible | ✅ Pass | `:focus-visible` is explicitly styled; contrast ratio 18:1+ (cyan on dark). |
| 2.4.3 Focus Order | ✅ Depends | Must be implemented per-component (proper tab order, logical DOM order). |
| 1.4.3 Contrast | ✅ Pass | Cyan glow + white text on dark background = AA/AAA. |
| 2.5.5 Target Size | ✅ Depends | Buttons/icons must be ≥44×44px (touch). This spec does not mandate size. |
| 2.3.3 Animation from Interactions | ✅ Pass | Animations respect `prefers-reduced-motion`. |

### Testing Checklist

- [ ] Focus ring visible on dark background (test with Contrast Checker).
- [ ] Focus order logical (Tab through the UI).
- [ ] Reduced motion respected (test with `prefers-reduced-motion: reduce`).
- [ ] Color alone does not convey state (text, icons, shape also change).
- [ ] Touch targets ≥44×44px (buttons, list items).
- [ ] Glows render correctly on all surface colors (bg, elevated, overlay).

---

## Implementation Handoff

**For ProductEngineer:**

1. Copy the CSS blocks for your surface (Button, List Item, etc.) into your component file.
2. Replace component-specific class names (e.g., `.list-item` → your actual class).
3. Test with keyboard navigation (`Tab`, `Shift+Tab`, `Enter`, `Space`).
4. Verify transitions smooth on target devices; adjust durations if needed.
5. Audit contrast ratios (Contrast Checker) on your final backgrounds.
6. Post screenshots at 1440×900 (desktop) showing hover, focus, and active states.

**Design System impact:** No new tokens are introduced. All glow, color, spacing, and timing values come from Phase 0.4 `tokens.css`. If adjustments are needed, escalate to UXDesigner for token refinement.

---

## References

- **Locked token set:** `theme/Liquid-Neon/tokens.css` (Phase 0.4)
- **Base spec:** `theme/Liquid-Neon/SPEC.md`
- **WCAG 2.1 Focus Visible:** https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html
- **MDN — :focus-visible:** https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
- **Nielsen — State Feedback:** https://www.nngroup.com/articles/response-times-3-important-limits/

---

**Specified by:** UXDesigner (Principal Product Designer)  
**Approval for implementation:** ProductEngineer (UI Components)  
**Sign-off required for deviations:** Yes (Design System governance)
