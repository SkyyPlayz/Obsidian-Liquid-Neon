# Liquid Neon — Design Spec (carried from Mythos Writer)

> **Source:** This is the canonical Liquid Neon design language as defined and partially
> implemented in the **Mythos Writer** project (CEO decision MYT-516; tokens MYT-520 §1,
> shipped in `frontend/src/tokens.css`). This Obsidian theme reuses the *same* visual
> language so the two products stay consistent. Where Mythos Writer is an Electron/React
> app, the values below are the source of truth; the **Obsidian mapping** column shows how
> to wire each token into Obsidian's CSS-variable system.
>
> Compiled for the repo goals by **Ivy** (PaperclipAI management) on 2026-05-31, from
> `plans/ProjectGoalOverView/12-visual-design-system.md` and `frontend/src/tokens.css`.

---

## 1. Design intent

A calm, immersive, long-session-comfortable workspace where depth and hierarchy are
communicated by **light, blur, and subtle motion** rather than heavy borders. The look is
**translucent frosted-glass surfaces with restrained neon accents**, applied **uniformly
across every surface** — editor, file explorer, side rails, tabs, command palette, modals,
graph view. Neon is treated as **directional lighting and state**, never as the fill color
for large text blocks.

This matches the user's stated goal for the theme: transparent "liquid glass" surfaces with
cyan / violet / magenta neon borders + glow, a changeable app background, neon-frame hover,
and a "neon stars" graph view — adapting the **Obsidian-CyberGlow** theme as the starting point.

## 2. Non-negotiable constraints (carry these verbatim)

1. **Legibility wins.** Body text contrast **≥ 4.5:1** on every panel background, at all times.
2. **Neon = accent + state only.** Thin frames (1–3px), soft outward falloff, subtle hover
   pulse. Never use neon as the fill color for body text or large surfaces.
   (Note: violet on glass measures 4.06:1 — *below* the floor — so violet is accent-only by rule.)
3. **Performance.** Cap blur radii (≤ 40px), animate only composited `transform`/`opacity`,
   use `backdrop-filter: blur()` with an **opaque fallback** where unsupported.
4. **Reduced-motion** disables pulsing and parallax.
5. **Accessibility focus indicators** in addition to neon frames — never color alone.
6. **Dark-only.** Liquid Neon is a single dark theme. A high-contrast accessibility mode
   **composes on top** (see §9), it is not a separate palette.

## 3. Color — base palette (static anchors)

| Token | Value | Role |
|---|---|---|
| `--neon-cyan` | `#00F0FF` | primary accent / hover frame / focus ring |
| `--neon-violet` | `#9B5FFF` | secondary accent / heading accent words |
| `--neon-magenta` | `#FF4DFF` | tertiary accent / emphasis, destructive-hover |
| `--text-header` | `#EDECF6` | titles, active labels (warm white) — 13.3:1 |
| `--text-body` | `#BFD6E8` | paragraphs, UI copy (soft gray-blue) — 10.4:1 |
| `--text-muted` | `#8A9BB0` | captions/disabled-adjacent — lowest legible tier (≥ 4.5:1 everywhere) |

Neon gradient (for multi-color frames/underlines):
`linear-gradient(120deg, #00F0FF 0%, #9B5FFF 50%, #FF4DFF 100%)`

There is **no sub-muted text tier** — for purely decorative dimming use opacity, not a
darker color (a darker tier failed the 4.5:1 floor).

## 4. Color — surfaces (default, soft-leaning ≈ 0.40 on the softness axis)

| Token | Value | Role | Obsidian mapping |
|---|---|---|---|
| `--bg-base` | `#0E1116` | app shell / canvas — deep charcoal, not black | `--background-primary` base |
| `--bg-canvas` | `#0B0E13` | deepest layer behind content | `--background-primary-alt` |
| `--bg-inset` | `#15191F` | wells, inputs, code blocks | `--background-secondary` / code bg |
| `--bg-elevated` | `#222A36` | popovers, raised cards | modal / popover bg |
| `--glass-fill` | `rgba(14,14,18,0.72)` | live glass panel fill | panel/sidebar bg (with `backdrop-filter`) |
| `--glass-fill-fallback` | `rgba(18,18,20,0.92)` | opaque fallback (no backdrop-filter) | fallback panel bg |
| `--glass-rim` | `rgba(255,255,255,0.12)` | 1px bright inner rim | inner highlight |
| `--glass-border` | `rgba(255,255,255,0.07)` | glass edge highlight | `--background-modifier-border` |
| `--glass-inner-shadow` | `inset 0 1px 24px rgba(20,16,40,0.45)` | inner depth | panel inner shadow |
| `--bg-vignette` | `radial-gradient(120% 120% at 50% 0%, #141B26 0%, #0E1116 55%, #0B0E13 100%)` | canvas vignette | app wrapper overlay |

**Borders (white-alpha tiers):** subtle `rgba(255,255,255,0.06)` · default `rgba(255,255,255,0.10)` · strong `rgba(255,255,255,0.16)`.

## 5. Background image (a headline feature for this theme)

The user wants a **default background image for the whole app** (not just the editor pane),
**user-changeable**, accepting a **local image file** (the existing background plugin is
web-URL-only and editor-pane-only — both limitations to fix). Mythos Writer already models
this with these tokens — reuse them:

| Token | Default | Role |
|---|---|---|
| `--bg-app-image` | `none` | full-cover wallpaper behind all glass panels |
| `--bg-image-size` | `cover` | fit (cover / contain / tile) |
| `--bg-image-repeat` | `no-repeat` | tiling |
| `--bg-image-position` | `center` | position |
| `--bg-scrim-alpha` | `0` | darkening scrim, **auto-raised by the contrast guard** to keep text ≥ 4.5:1 over any image |
| `--bg-vignette-alpha` | `0.4` | vignette overlay strength |

> ⚠️ **Theme vs. plugin:** a pure CSS theme can read a wallpaper *variable* but cannot offer
> an in-app file **picker** or persist a chosen local image. The whole-app, user-changeable,
> local-file background almost certainly needs a **companion plugin**. This is the open
> theme-vs-plugin question — resolve it before locking the Phase 1 background approach.
> The contrast guard (auto-scrim) is likewise plugin/JS logic, not static CSS.

## 6. Radii, spacing, type

- **Radii:** xs 8 · sm 12 · md 16 · lg 20 · xl 24 · full 999px (tabs/chips→buttons/cards→panels/dialogs).
- **Spacing:** 4px base scale — 4 / 8 / 12 / 16 / 20(default panel pad) / 24 / 32 / 40(min control target) / 48.
- **Type:** `Inter, "SF Pro Text", "Segoe UI", system-ui, sans-serif`; base 16/1.6. Headings 600–700, body 400, tracking-heading −0.02em. Scale: 12 / 14 / 16 / 18 / 20 / 24 / 28.

## 7. Neon glow, frames, hover & focus

| Token | Value | Notes |
|---|---|---|
| `--neon-intensity` | `0.75` | master 0–1 multiplier; `0` disables all glow |
| `--glow-sm` / `--glow-md` / `--glow-lg` | `0 0 16px` / `0 0 28px` / `0 0 48px` | compose with a color, e.g. `var(--glow-sm) var(--neon-cyan)` |
| `--frame-width-rest` | `1px` | resting neon frame |
| `--frame-width-hover` | `3px` | hover neon frame |

Multi-color chrome frames (from Mythos Writer `SKY-127`):
- **Default:** `0 0 16px <neon-gradient>, 0 0 2px var(--neon-cyan)`
- **Hover:** `0 0 24px <neon-gradient>, 0 0 4px var(--neon-cyan)`
- **Folder context:** violet→magenta→violet gradient + `0 0 2px var(--neon-violet)`
- **File context:** cyan→violet→cyan gradient + `0 0 2px var(--neon-cyan)`

**Hover behavior (matches the user's goal):** add a **neon frame** and fill the element with
the theme color at low opacity (`--accent-soft: rgba(0,240,255,0.12)`) plus a subtle **inner
glow** — the CyberGlow fill + a Liquid Neon outer frame. No constant animation.

**Selected/active pane (user's explicit inversion of CyberGlow):** make the **active** pane
**sharper/clearer** and slightly **blur + dim the rest**, subtly. Do *not* highlight the
active pane with a fill the way CyberGlow does — do the opposite.

**Navigation:** Liquid-Neon left rail / file explorer / tabs, but **keep CyberGlow's blue
side-bar lines**.

## 8. Motion

Curves: `--ease-out: cubic-bezier(0.16,1,0.3,1)`, `--ease-standard: cubic-bezier(0.4,0,0.2,1)`.
Durations all ≤ 320ms (under the 400ms Doherty threshold): press 100ms · hover-in 180ms ·
hover-out 240ms · panel 280ms. All pulses/parallax **off** under `prefers-reduced-motion`.

## 9. Softness↔Contrast axis + Advanced UI (aspirational; needs a plugin)

Mythos Writer exposes a single continuous **Softness↔Contrast slider** that interpolates four
runtime tokens along one axis (persisted per user, contrast-floor-guarded):

| Value | CSS var | Soft → Sharp |
|---|---|---|
| Backdrop blur | `--lg-blur` / `--blur-panel` | 24px → 8px |
| Glass fill opacity | `--lg-glass` / `--glass-fill` | 0.58 → 0.90 |
| Neon glow intensity | `--lg-neon` / `--neon-intensity` | 0.60 → 0.35 |
| Style softness | `--lg-style` | 0 → 1 |

An **Advanced UI** popover (MYT-708) further exposes per-value sliders, per-element color
pickers, the background image controls, and a reset-to-default. **All of this is interactive
state → it requires a plugin in Obsidian.** For a CSS-only theme, ship sensible defaults
(the values in §3–§8) and treat the slider/advanced controls as a plugin-tier feature.

## 10. Accessibility — high-contrast mode (composes on top, not a separate theme)

Triggered by an explicit setting (`[data-contrast="high"]`), `prefers-contrast: more`,
`prefers-reduced-transparency`, or `forced-colors`. When active: **glass → opaque solid
fills**, **neon → solid strokes with glow removed** (`--neon-intensity: 0`), **blur → 0**,
text raised to AAA (white `#FFFFFF` body ≈ 16:1 on `#15191F`; muted `#D6E0EC` ≈ 12:1),
borders raised to ≥ 3:1 for UI components, accent flattened to a solid `#C9B6FF` stroke.
Also: opaque fallbacks under `prefers-reduced-transparency` and when `backdrop-filter` is
unsupported. This mode must **compose with, never override**, the base theme.

## 11. Reference images

Annotated target images live in this repo under `Plans/Goal/Overview/immages/` (background,
CyberGlow hover/navigator examples, Liquid Neon button-hover / navigator / graph-view
examples, neon frames, highlight examples). Mythos Writer's originals live in its repo under
`plans/ProjectGoalOverView/Liquid-Neon-theme-examples/`.

## 12. Phase mapping (this repo's board, project `0b70eb53…`)

- **Phase 0.4 — Design tokens:** lift §3–§8 directly (palette, glass, radii, blur, neon, motion).
- **Phase 1 — Visual foundation:** `--bg-base` + vignette + glass surfaces + §5 background image
  (decide theme-vs-plugin first).
- **Phase 2 — Interaction:** §7 hover (neon frame + low-opacity fill + inner glow) and the
  inverted active-pane focus.
- **Phase 3 — Navigation:** Liquid-Neon left rail / explorer / tabs, keep CyberGlow blue side lines.
- **Phase 4 — Graph view:** neon-stars nodes + neon arc edges (cosmic look).
- **Phase 5 — Distribution:** screenshots, README, community-theme submission.

---

*Maintained alongside the user's hand-written goal doc (`Plans/Goal/Overview/Goal`). If the
Liquid Neon language evolves in Mythos Writer, update this file to match.*
