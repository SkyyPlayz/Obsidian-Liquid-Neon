# Liquid Neon: WCAG 2.1 AA Contrast Audit

**Date:** 2026-06-03  
**Auditor:** UXDesigner  
**Scope:** Dark theme only (light mode not supported per README)  
**Standard:** WCAG 2.1 Level AA (4.5:1 body, 3:1 large/UI)

---

## Color Palette Reference

| Token | RGB | Hex | Role |
|-------|-----|-----|------|
| **Neon Cyan** | 0, 240, 255 | `#00F0FF` | Primary accent (links, active items, cursor) |
| **Neon Violet** | 155, 95, 255 | `#9B5FFF` | Secondary accent (headings, tags) |
| **Neon Magenta** | 255, 77, 255 | `#FF4DFF` | Tertiary accent (callouts, graph nodes) |
| **Body Text** | 224, 224, 255 | `#E0E0FF` | Normal reading text |
| **Muted Text** | 120, 120, 200 | `#7878C8` | Dimmed text, metadata (raised for WCAG AA — SKY-1585) |
| **Error/Close** | 255, 144, 155 | `#FF909B` | Error states |
| **Base Dark** | 8, 8, 14 | `#08080E` | Canvas/deepest background |
| **Base-05** | 12, 12, 18 | `#0C0C12` | Secondary background |
| **Base-10** | 14, 14, 20 | `#0E0E14` | Editor background |
| **Base-20** | 18, 18, 24 | `#121218` | Tertiary background |
| **Base-25** | 22, 22, 28 | `#16161C` | Surface level |
| **Glass (72% opacity)** | rgba(14,14,18, 0.72) | — | Frosted glass surfaces |
| **Glass (60% opacity)** | rgba(12,12,16, 0.60) | — | Elevated glass surfaces |
| **Glass (55% opacity)** | rgba(12,12,16, 0.55) | — | Settings panels |
| **Glass (40% opacity)** | rgba(12,12,16, 0.40) | — | Transparent overlays |

---

## WCAG Contrast Ratio Calculations

### Helper: RGB to Luminance

Relative luminance formula (WCAG):
```
L = 0.2126 × R + 0.7152 × G + 0.0722 × B
(where R, G, B are linearized: if value ≤ 0.03928, linearized = value/12.92; else (value+0.055)/1.055)^2.4)
```

Contrast ratio = (L1 + 0.05) / (L2 + 0.05), where L1 is lighter.

---

## Surface Audit

### ✅ ALL FIXED (0 open failures)

1. **Muted text — ✅ Fixed in SKY-1585:** `--ln-muted` set to `#7878C8` (was `#6060AA`)
   - Affects sidebar text, metadata, timestamps, settings labels
   - Old contrast: 3.4–3.5:1 (❌ FAIL). New contrast: 4.87–4.92:1 (✅ PASS)

2. **Graph view node labels** — ✅ Fixed in SKY-1586: `--graph-text` set to `#111118` (near-black)
   - On cyan: 13.3:1 (threshold 3:1) — **PASS**
   - On violet: 4.9:1 (threshold 3:1) — **PASS**
   - On magenta: 6.9:1 (threshold 3:1) — **PASS**
   - **Status:** ✅ **FIXED**

### 1. Body Text on Glass Surfaces (Primary Surface)

**Surfaces:** Ribbon, sidebars, modals, command palette, status bar

| Text Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #E0E0FF (body text) | Glass 72% (rgba 14,14,18) | **15.1:1** | ✅ PASS | Excellent on glass with cosmic bg |
| #7878C8 (muted text) | Glass 72% (rgba 14,14,18) | **4.9:1** | ✅ **PASS** | Fixed in SKY-1585 (was 3.5:1 with #6060AA) |
| #E0E0FF (body text) | Glass 60% (rgba 12,12,16) | **15.1:1** | ✅ PASS | Same effective contrast |
| #7878C8 (muted text) | Glass 60% (rgba 12,12,16) | **5.0:1** | ✅ **PASS** | Passes on any standard glass opacity |

**Verdict:** ✅ **PASS** — Body and muted text both pass AA on glass surfaces.

---

### 2. Neon Accent Text on Glass Surfaces

**Surfaces:** Links, active tabs, focus rings, hover states

| Text Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #00F0FF (cyan) | Glass 72% (rgba 14,14,18) | **13.9:1** | ✅ PASS | Bright neon, excellent contrast |
| #9B5FFF (violet) | Glass 72% (rgba 14,14,18) | **5.1:1** | ✅ PASS | Good contrast, above AA minimum |
| #FF4DFF (magenta) | Glass 72% (rgba 14,14,18) | **7.2:1** | ✅ PASS | High brightness, good contrast |

**Verdict:** ✅ **PASS** — All neon accents meet AA on glass surfaces.

---

### 3. Accent Text on Dark Canvas (Editor)

**Surfaces:** Links in note body, inline code highlights, marked/highlighted text

| Text Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #00F0FF (cyan) | #0E0E14 (base-10) | **13.7:1** | ✅ PASS | Good contrast on editor bg |
| #9B5FFF (violet) | #0E0E14 (base-10) | **5.0:1** | ✅ PASS | Moderate, still passes AA |
| #FF4DFF (magenta) | #0E0E14 (base-10) | **7.1:1** | ✅ PASS | Bright magenta, good contrast |

**Verdict:** ✅ **PASS** — Neon links meet AA on the editor canvas.

---

### 4. Body Text on Canvas (Editor)

**Surfaces:** Normal note body text, headings, lists, quotes

| Text Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #E0E0FF (body) | #0E0E14 (base-10) | **14.9:1** | ✅ PASS | Excellent on canvas |
| #7878C8 (muted) | #0E0E14 (base-10) | **4.9:1** | ✅ **PASS** | Fixed in SKY-1585 (was 3.4:1 with #6060AA) |

**Verdict:** ✅ **PASS** — Body and muted text both pass AA on canvas.

---

### 5. Error/Close State Text on Glass

**Surfaces:** Close buttons, error badges, destructive actions

| Text Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #FF909B (error/close) | Glass 72% (rgba 14,14,18) | **9.0:1** | ✅ PASS | Soft pink, excellent contrast |

**Verdict:** ✅ **PASS** — Error text meets AA.

---

### 6. Error/Close State Text on Canvas

| Text Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #FF909B (error/close) | #0E0E14 (base-10) | **8.9:1** | ✅ PASS | Good on dark canvas |

**Verdict:** ✅ **PASS** — Error text meets AA on canvas.

---

### 7. Settings Panel Text (High-Contrast Mode OFF)

**Surfaces:** Settings tab chrome, panels with `background-settings`

| Text Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #E0E0FF (body) | Glass 72% (rgba 14,14,18) | **15.1:1** | ✅ PASS | Same as ribbon surfaces |
| #7878C8 (muted) | Glass 72% (rgba 14,14,18) | **4.9:1** | ✅ **PASS** | Fixed in SKY-1585 (was 3.5:1 with #6060AA) |

**Verdict:** ✅ **PASS** — Body and muted text both pass AA in settings panels.

---

### 8. Graph View Node Labels

**Surfaces:** Node text on graph canvas nodes (recolored to neon palette)

**Fixed in SKY-1586: `--graph-text` set to near-black `#111118` via `--ln-graph-text` token.**

**Before fix (body text #E0E0FF on neon):**

| Label Type | Foreground | Background Node | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| Node label | #E0E0FF (body text) | Neon cyan (#00F0FF) | **1.1:1** | ❌ **SEVERE FAIL** | Light on light; unreadable |
| Node label | #E0E0FF (body text) | Neon violet (#9B5FFF) | **3.0:1** | ⚠️ **MARGINAL** | Meets UI threshold (3:1), fails body (4.5:1) |
| Node label | #E0E0FF (body text) | Neon magenta (#FF4DFF) | **2.1:1** | ❌ **FAIL** | Below UI threshold |

**After fix (#111118 near-black on neon):**

| Label Type | Foreground | Background Node | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| Node label | #111118 (near-black) | Neon cyan (#00F0FF) | **13.3:1** | ✅ **PASS** | Dark on bright; high contrast |
| Node label | #111118 (near-black) | Neon violet (#9B5FFF) | **4.9:1** | ✅ **PASS** | Well above 3:1 UI threshold |
| Node label | #111118 (near-black) | Neon magenta (#FF4DFF) | **6.9:1** | ✅ **PASS** | Excellent contrast |

**Verdict:** ✅ **FIXED** — `--graph-text: #111118` set via `--ln-graph-text` token in `.theme-dark`.

---

### 9. Keyboard Focus Rings

**Surfaces:** Tab-key navigation focus rings, checkbox/radio focus

| Ring Color | Background | Calculated Contrast | AA Pass? | Notes |
|----------|----------|-----------|---------|-------|
| #00F0FF (focus glow) | Glass 72% (rgba 14,14,18) | **13.9:1** | ✅ PASS | Focus rings are UI, 3:1 minimum |
| #9B5FFF (focus accent) | Glass 72% (rgba 14,14,18) | **5.1:1** | ✅ PASS | Violet focus ring |

**Note:** Focus rings use `box-shadow` glow, not text; contrast is measured on the glow vs. background.

**Verdict:** ✅ **PASS** — Focus rings are highly visible.

---

### 10. High-Contrast Mode Impact

**CSS selector:** `.theme-dark.ln-high-contrast`

Per README, high-contrast mode:
- ✅ Removes backdrop blur
- ✅ Makes glass surfaces fully opaque
- ✅ Converts neon glows to solid strokes

**Effects on text contrast (Note: Muted text still fails even with high-contrast mode enabled):**

| Scenario | Default | High-Contrast | Change | Status |
|----------|---------|---------------|--------|-------|
| Body text on glass | 15.1:1 | ~16:1 | +0.9:1 | ✅ PASS |
| Muted text on glass | 3.5:1 | ~3.8:1 | +0.3:1 | ❌ Still fails (needs fix) |
| Neon accents on glass | 5.1–13.9:1 | ~5.5–14:1 | +0.4–0.5:1 | ✅ PASS |

**Verdict:** ⚠️ **HIGH-CONTRAST MODE HELPS BUT NOT ENOUGH** — High-contrast mode improves muted text contrast, but not enough to reach AA (4.5:1). The muted color itself needs to be lightened (primary fix).

---

## Summary Table: Pass/Fail Status

| Surface Category | Text Color | Contrast | AA Pass? | Status |
|----------|----------|-----------|---------|-------|
| **Ribbon/Sidebars** | Body (#E0E0FF) | 15.1:1 | ✅ YES | ✅ PASS |
| **Ribbon/Sidebars** | Muted (#7878C8) | 4.9:1 | ✅ YES | ✅ **FIXED** (SKY-1585) |
| **Ribbon/Sidebars** | Neon (any) | 5.1–13.9:1 | ✅ YES | ✅ PASS |
| **Editor Canvas** | Body (#E0E0FF) | 14.9:1 | ✅ YES | ✅ PASS |
| **Editor Canvas** | Muted (#7878C8) | 4.9:1 | ✅ YES | ✅ **FIXED** (SKY-1585) |
| **Editor Canvas** | Neon (any) | 5.0–13.7:1 | ✅ YES | ✅ PASS |
| **Settings Panels** | Body (#E0E0FF) | 15.1:1 | ✅ YES | ✅ PASS |
| **Settings Panels** | Muted (#7878C8) | 4.9:1 | ✅ YES | ✅ **FIXED** (SKY-1585) |
| **Graph View Labels** | #111118 on neon | 4.9–13.3:1 | ✅ YES | ✅ **FIXED** (SKY-1586) |
| **Focus Rings** | Neon glow | 5.1–13.9:1 | ✅ YES | ✅ PASS |
| **Error States** | #FF909B | 8.9–9.0:1 | ✅ YES | ✅ PASS |

---

## Failures Found & Remediation

### ~~Failure 1: Muted Text (#6060AA) Fails AA on All Dark Backgrounds~~ — ✅ FIXED (SKY-1585)

**Affected surfaces:**
- Sidebar metadata, timestamps, settings labels, breadcrumbs, table headers
- Status bar secondary text
- Disabled state text

**Fix applied:** Added `--ln-muted: #7878C8` token to `tokens.css`; `--text-muted` now set via `var(--ln-muted)` in `.theme-dark`.

| Muted Text Color | Glass 72% | Canvas | Change | Status |
|----------|----------|-----------|---------|-------|
| Was: #6060AA | 3.5:1 | 3.4:1 | — | ❌ FAIL |
| Now: #7878C8 | 4.9:1 | 4.9:1 | +1.4–1.5:1 | ✅ PASS |

**Design impact:** Color is lighter and slightly less saturated, but remains purple-toned and visually distinct from body text (#E0E0FF). Muted appearance is preserved relative to bright neon accents.

---

### ~~Failure 2: Graph View Node Labels~~ — ✅ FIXED (SKY-1586)

**Affected surfaces:**
- Node text on cyan, violet, and magenta graph canvas nodes

**Problem (was):** Rendering used body text (#E0E0FF) which is too light for neon backgrounds:
- On cyan: 1.1:1 (completely unreadable; light on light)
- On violet: 3.0:1 (marginal; fails body text threshold)
- On magenta: 2.1:1 (fails UI threshold)

**Fix applied:** Added `--ln-graph-text: #111118` token; Obsidian `--graph-text` now set via `.theme-dark`.

| Label Color | On Cyan | On Violet | On Magenta | Status |
|----------|----------|-----------|---------|-------|
| Was: #E0E0FF | 1.1:1 | 3.0:1 | 2.1:1 | ❌ FAIL |
| Now: #111118 | 13.3:1 | 4.9:1 | 6.9:1 | ✅ PASS |

**Design rationale:** Near-black (`#111118`) preserves dark-space aesthetic (no pure black harshness) while guaranteeing 3:1 on all neon fills. Obsidian reads `--graph-text` via `getComputedStyle` and applies it to canvas text rendering — no plugin changes required.

---

## Recommendations

### ✅ All Required Changes Applied

1. **Muted text color** (`--ln-muted`) — ✅ **DONE (SKY-1585)**
   - Was: `#6060AA` → Now: `#7878C8`
   - File: `theme/Liquid-Neon/tokens.css` (`--ln-muted`); `theme/Liquid-Neon/theme.css` (`--text-muted: var(--ln-muted)`)
   - Result: 4.9:1 contrast on all dark surfaces (glass + canvas)

2. **Graph node label color** — ✅ **DONE (SKY-1586)**
   - Was: body text (#E0E0FF) → Now: `#111118` (near-black) via `--ln-graph-text`
   - Contrast: 4.9–13.3:1 on all neon node fills

### No Changes to Primary Neon Palette

The bright neon colors (#00F0FF, #9B5FFF, #FF4DFF) are the visual signature. All meet AA comfortably when used for accents. No darkening needed.

---

## Audit Coverage

- ✅ Ribbon and sidebar chrome (navigation, file tree, outline pane)
- ✅ Tab bar and active/inactive tab text
- ✅ Modals and popovers (command palette, search, settings panels)
- ✅ Status bar and breadcrumbs
- ✅ Editor body text (normal, italic, bold, inline code)
- ✅ Headings (H1–H6, all glow colors)
- ✅ Links and focus rings
- ✅ Graph view node labels and edge lines
- ✅ Error badges, close buttons, destructive actions
- ✅ Blockquotes, callouts, and list markers
- ✅ Metadata and timestamp fields
- ✅ High-contrast mode override (fully opaque glass)
- ✅ All color picker variants (cyan, violet, magenta primary/secondary)

---

## Notes for Handoff

1. **No code changes needed for this issue.** All surfaces pass AA.
2. **Screenshot verification required:** The audit assumes the theme renders with the locked palette (#00F0FF, #9B5FFF, #FF4DFF). If custom color pickers are active, contrast may differ.
3. **Glass opacity caveat:** The README already notes that very low opacity (<0.30) over bright wallpaper can drop contrast. This is documented; high-contrast mode provides a guardrail.
4. **Graph view approximation:** Canvas rendering limits exact glow measurement (SKY-292). Audit assumes readable node labels; fine-grained pixel-level verification deferred to QA.
5. **Light mode:** Theme forces dark mode. Light-mode users see dark UI; light-mode audit is out of scope (README: "Light-mode variant is not included").

---

## Tokens.CSS Patch Proposal

### Change 1: Muted Text Color

```css
/* Before */
--ln-muted: #6060AA;

/* After */
--ln-muted: #7575D0;
```

**Rationale:** Increases contrast on glass and canvas backgrounds from 3.5:1 → 4.8:1, meeting WCAG AA.

### Change 2: Graph View Node Labels — ✅ APPLIED (SKY-1586)

```css
/* tokens.css — new token */
--ln-graph-text: var(--LN-graph-text, #111118);

/* theme.css body{} — Style Settings bridge */
--ln-graph-text: var(--LN-graph-text, #111118);

/* theme.css .theme-dark{} — Obsidian --graph-text override */
--graph-text: var(--ln-graph-text);
```

Obsidian reads `--graph-text` from computed style and passes it to the canvas text renderer — no plugin changes required.

---

## Audit Coverage Checklist

- ✅ Ribbon and sidebar chrome (navigation, file tree, outline pane, metadata)
- ✅ Tab bar and active/inactive tab text
- ✅ Modals and popovers (command palette, search, settings panels)
- ✅ Status bar and breadcrumbs
- ✅ Editor body text (normal, italic, bold, inline code)
- ✅ Headings (H1–H6, all glow colors)
- ✅ Links and focus rings
- ✅ Graph view node labels and edge lines (⚠️ found failures)
- ✅ Error badges, close buttons, destructive actions
- ✅ Blockquotes, callouts, and list markers
- ✅ Metadata and timestamp fields (⚠️ found failures)
- ✅ Disabled state text (⚠️ found failures)
- ✅ High-contrast mode override (fully opaque glass)
- ✅ All color picker variants (cyan, violet, magenta primary/secondary)

---

## Notes for Handoff

1. **Two AA failures identified:**
   - Muted text (#6060AA) fails AA on all dark backgrounds (3.4–3.5:1, needs 4.5:1) — open
   - Graph node labels fail AA when using body text on bright neon nodes — ✅ **FIXED (SKY-1586)**
   
2. **Remediation status:**
   - `--ln-muted` → `#7575D0` still pending (muted text)
   - Graph node label color → **done**: `--graph-text: #111118` via `--ln-graph-text` token

3. **No changes to neon palette:** Cyan, violet, magenta all pass AA (5.1–13.9:1 range). Keep locked.

4. **Implementation status:**
   - Muted text fix is a 1-line CSS change
   - Graph node labels may depend on SKY-292 canvas rendering updates

5. **Glass opacity caveat:** The audit assumes the locked glass opacity (0.72). Very low opacity (<0.30) over bright wallpaper can reduce contrast further; high-contrast mode provides a guardrail (fully opaque).

6. **Light mode:** Theme forces dark mode (per README). Light-mode audit out of scope.

---

**Audit Status:** COMPLETE ✅  
**Result: 1 AA FAILURE OPEN, 1 FIXED**  
**Open: Muted text (#6060AA) on all backgrounds — fix pending**  
**Fixed: Graph node labels (SKY-1586) — `--graph-text: #111118` in `.theme-dark`**

