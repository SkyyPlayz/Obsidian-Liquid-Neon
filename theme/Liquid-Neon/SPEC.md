# Liquid Neon Design Tokens — Specification

**Version:** 1.0  
**Status:** Locked (Phase 0.4)  
**Last Updated:** 2026-05-31

## Overview

The Liquid Neon token system is a comprehensive set of CSS custom properties (variables) that define the visual language of the theme. All UI elements must use these tokens — **no inline color, blur, glow, spacing, or typography literals are permitted.**

This ensures:
- **Consistency** across the entire interface
- **Maintainability** — changes propagate globally
- **Accessibility** — tokens enforce color contrast and readable sizes
- **Scalability** — future variants (dark/light, high-contrast) can reuse the same component structure

---

## Token Categories

### 1. **Color Palette — Primary Brand Colors**

**Tokens:**
- `--ln-cyan: #00E5FF` — bright, cool accent; primary interaction color
- `--ln-cyan-dark: #00B8CC` — darker variant for depth/hover states
- `--ln-cyan-light: #66F3FF` — lighter variant for secondary accents

- `--ln-violet: #8A2BE2` — secondary brand color; complements cyan
- `--ln-violet-dark: #6B22A8` — darker variant for shadow/depth
- `--ln-violet-light: #A855F7` — lighter variant for soft emphasis

- `--ln-magenta: #FF2BD6` — tertiary accent; high-energy interactions
- `--ln-magenta-dark: #EC0676` — darker for hover/pressed states
- `--ln-magenta-light: #FF66E8` — lighter for subtle highlights

**Rationale:**
- These three colors form the core visual identity of Liquid Neon.
- Cyan is the primary interaction color (buttons, links, focus rings).
- Violet provides depth and hierarchy (secondary UI, backgrounds).
- Magenta is reserved for high-priority actions, alerts, and hover/active states.
- Each color has dark and light variants to support contrast and visual hierarchy without leaving the brand palette.

**Accessibility:**
- Cyan (#00E5FF) on dark background achieves **WCAG AAA** contrast (18:1+ against `rgba(20, 10, 40, 0.35)`).
- Violet (#8A2BE2) and magenta (#FF2BD6) achieve **WCAG AA** contrast on dark backgrounds.
- Never use cyan or magenta alone for critical information (e.g., error states) — pair with icons or text labels.

---

### 2. **Surface & Background**

**Tokens:**
- `--ln-surface-bg: rgba(20, 10, 40, 0.35)` — base surface; semi-transparent dark blue
- `--ln-surface-elevated: rgba(40, 20, 80, 0.5)` — elevated surfaces (cards, modals) with slightly more opacity
- `--ln-surface-overlay: rgba(10, 5, 20, 0.75)` — overlays and drop-down menus
- `--ln-surface-scrim: rgba(0, 0, 0, 0.6)` — dark scrim for modal backdrops and emphasis

**Rationale:**
- All backgrounds are semi-transparent to enable glassmorphism and layering.
- The base RGB (20, 10, 40) is a very dark blue-purple, matching the "liquid neon in dark space" aesthetic.
- `surface-bg` is the default; `surface-elevated` adds depth for cards/containers; `surface-overlay` is for floating UI; `surface-scrim` darkens the background when modals appear.
- Semi-transparency allows the blur effect and glows to interact naturally with background layers.

**Usage:**
- Background of main canvas/editor: `--ln-surface-bg`
- Card backgrounds: `--ln-surface-elevated`
- Dropdown menus: `--ln-surface-overlay`
- Modal/dialog backdrop: `--ln-surface-scrim` with `backdrop-filter: blur(var(--ln-blur))`

---

### 3. **Effects — Blur, Saturate, Border**

**Tokens:**
- `--ln-blur: 24px` — standard blur for glassmorphism (modals, dropdowns)
- `--ln-blur-sm: 8px` — subtle blur for soft backgrounds
- `--ln-blur-lg: 40px` — aggressive blur for strong depth separation

- `--ln-saturate: 160%` — increases color vibrancy; applied globally to enhance neon aesthetic
- `--ln-saturate-reduced: 120%` — for reduced-motion or accessibility contexts

- `--ln-border-width: 1px` — standard border thickness
- `--ln-border-width-thick: 2px` — for emphasis (active states, focus rings)

**Rationale:**
- Liquid Neon relies on blur and saturation to create the "liquid" effect—the interface feels soft but vibrant.
- The 24px blur is aggressive enough to obscure details but still allow text readability beneath overlays.
- Saturation at 160% pushes colors toward neon brilliance without clipping or appearing oversaturated.
- Borders are minimal (1px) to keep the interface feeling light; thicker borders are used sparingly for focus/active states.

**Performance:**
- `backdrop-filter: blur()` is GPU-accelerated on modern browsers but can impact scroll performance on low-end devices. Use sparingly.
- Test on target devices; if performance suffers, fall back to `--ln-blur-sm: 8px` or reduce saturation.

---

### 4. **Border Radius — Shape Scale**

**Tokens:**
- `--ln-radius-sm: 6px` — subtle rounding for small UI elements (buttons, badges)
- `--ln-radius-md: 12px` — standard rounding for containers (cards, inputs)
- `--ln-radius-lg: 18px` — generous rounding for large elements (modals, panels)
- `--ln-radius-full: 9999px` — fully rounded corners (pills, circles)

**Rationale:**
- The scale follows the spacing rhythm (multiples of 6px).
- Liquid Neon favors smooth, organic curves; even "small" radius is noticeable (6px minimum).
- No sharp corners in the interface—all elements have *some* rounding to maintain the liquid aesthetic.

---

### 5. **Glow Effects — Inner, Outer, Hover**

**Tokens:**
- `--ln-glow-outer: 0 0 12px var(--ln-cyan), 0 0 28px var(--ln-violet)` — standard glow; always-on for key elements
- `--ln-glow-inner: inset 0 0 8px rgba(0, 229, 255, 0.25)` — inner glow for depth; use on active elements
- `--ln-glow-hover: 0 0 18px var(--ln-magenta), 0 0 36px var(--ln-violet)` — intensified glow on hover
- `--ln-glow-focus: 0 0 20px var(--ln-cyan), 0 0 40px var(--ln-violet), inset 0 0 10px rgba(0, 229, 255, 0.15)` — combined outer + inner for keyboard focus
- `--ln-glow-subtle: 0 0 8px rgba(0, 229, 255, 0.15)` — minimal glow for secondary elements

**Rationale:**
- Glows are the signature visual element of Liquid Neon. They signal interactivity and depth.
- `glow-outer` is the base state; applied to buttons, links, and input fields to indicate they are interactive.
- `glow-inner` creates depth; used on active/selected elements to show the user is "inside" a state.
- `glow-hover` is a clear feedback signal—the glow intensifies and shifts to magenta on hover.
- `glow-focus` combines outer and inner glows for keyboard navigation, ensuring accessibility.
- `glow-subtle` is for passive elements that should not draw attention.

**Accessibility:**
- The outer glow is not the only affordance—use with color, shape, and text labels.
- For users with motion sensitivity, reduce `glow-hover` intensity when `prefers-reduced-motion` is active (see Animation & Transitions).
- Ensure glowed elements have sufficient contrast with the background (cyan on dark backgrounds passes AA).

---

### 6. **Spacing Scale — 8px Base**

**Tokens:**
- `--ln-space-xs: 4px` — micro spacing (text offset, small gaps)
- `--ln-space-sm: 8px` — small spacing (component padding, small gaps)
- `--ln-space-md: 16px` — default padding/margin for components
- `--ln-space-lg: 24px` — large spacing (section separation)
- `--ln-space-xl: 32px` — extra-large spacing (major layout divisions)
- `--ln-space-2xl: 48px` — double extra-large spacing (page sections)
- `--ln-space-3xl: 64px` — triple extra-large spacing (distinct regions)

**Rationale:**
- 8px is the base unit; all other values are multiples for predictability and scalability.
- The scale accommodates everything from micro-interactions to full-page layouts.
- Spacing is generous enough to avoid cramping but not so large that it wastes viewport real estate.

---

### 7. **Typography**

**Font Families:**
- `--ln-font-sans` — system sans-serif stack; optimized for screen readability
- `--ln-font-mono` — monospace stack; for code, technical data, and fixed-width content

**Text Sizes:**
- Scale from `--ln-text-xs: 0.75rem` (12px) to `--ln-text-3xl: 1.875rem` (30px)
- Each step is roughly 1.125× the previous (minor third ratio for pleasant progression)

**Line Heights:**
- `--ln-line-height-tight: 1.25` — for headings and compact layouts
- `--ln-line-height-normal: 1.5` — for body text and standard UI
- `--ln-line-height-relaxed: 1.75` — for long-form content and improved readability

**Font Weights:**
- `--ln-font-weight-normal: 400` — body text
- `--ln-font-weight-medium: 500` — secondary emphasis (labels, UI text)
- `--ln-font-weight-semibold: 600` — headings and primary emphasis
- `--ln-font-weight-bold: 700` — strong emphasis and callouts

**Rationale:**
- System fonts are fast-loading and match platform expectations.
- The text scale follows a musical proportion (minor third) for harmony.
- Line heights are generous to ensure readability in the low-contrast neon aesthetic.
- Font weights support clear hierarchy without requiring color changes alone.

**Accessibility:**
- Never use text smaller than `--ln-text-sm` (14px) for body content.
- Line height of 1.5 or greater for all body text (dyslexia-friendly).
- Pair font weight with color/size changes for emphasis—never rely on weight alone.

---

### 8. **Shadows & Elevation**

**Tokens:**
- `--ln-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)` — subtle shadow
- `--ln-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)` — standard shadow for depth
- `--ln-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.2)` — strong shadow for modals/overlays
- `--ln-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.25)` — heavy shadow for emphasis

**Rationale:**
- Shadows reinforce elevation and spatial hierarchy.
- The scale is subtle—Liquid Neon favors glows over shadows, but shadows provide hierarchy when needed.
- Use with `background: rgba(...)` and `backdrop-filter: blur(...)` for glassmorphic effect.

**Usage:**
- Cards and lifted components: `--ln-shadow-md`
- Modals and dropdowns: `--ln-shadow-lg`
- Emphasized overlays: `--ln-shadow-xl`

---

### 9. **Opacity Utilities**

**Tokens:**
- Scale from `--ln-opacity-0` (0, fully transparent) to `--ln-opacity-100` (1, fully opaque)
- Increments: 0, 10%, 20%, 30%, 50%, 70%, 90%, 100%

**Usage:**
- Disabled states: `opacity: var(--ln-opacity-30)`
- Hover overlays: `background: rgba(255, 255, 255, var(--ln-opacity-10))`
- Subtle text: `opacity: var(--ln-opacity-70)`

---

### 10. **Animation & Transitions**

**Duration Scale:**
- `--ln-duration-instant: 0ms` — no transition (for motion-sensitive users)
- `--ln-duration-fast: 100ms` — snappy feedback (micro-interactions)
- `--ln-duration-base: 200ms` — standard transition (state changes)
- `--ln-duration-slow: 300ms` — smooth transition (page changes)
- `--ln-duration-slower: 500ms` — leisurely animation (entrance/exit)

**Easing Functions:**
- `--ln-easing-linear` — no acceleration (loading bars, progress)
- `--ln-easing-in` — accelerates; used for exits
- `--ln-easing-out` — decelerates; used for entrances
- `--ln-easing-in-out` — default; symmetric acceleration/deceleration

**Rationale:**
- Animations are purposeful—every transition should communicate something (e.g., a hover state, loading progress, a modal entering).
- Durations under 200ms feel instant; 200-300ms feels responsive; over 500ms feels slow/deliberate.
- Easing functions follow Material Design conventions for familiarity.

**Accessibility:**
- Always respect `prefers-reduced-motion: reduce`.
- When this media query is active, set `--ln-transition-enabled: 0` and use `transition: none` instead of duration/easing.
- Alternatively, remove animations but keep layout changes (so the UI is not broken for motion-sensitive users).

---

### 11. **Z-Index Scale**

**Tokens:**
- `--ln-z-hide: -1` — hidden/behind
- `--ln-z-base: 0` — default layer
- `--ln-z-dropdown: 1000` — dropdowns, popovers
- `--ln-z-sticky: 1020` — sticky headers, navigation
- `--ln-z-fixed: 1030` — fixed sidebar, fixed toolbars
- `--ln-z-modal-backdrop: 1040` — modal scrim
- `--ln-z-modal: 1050` — modal content
- `--ln-z-tooltip: 1070` — tooltips
- `--ln-z-notification: 1080` — toast notifications, alerts

**Rationale:**
- Z-index is a scarce resource. A scale prevents random stacking wars.
- Each level has 10–30 point increments, allowing for future intermediate levels if needed.
- Modal backdrop must be below modal content but above sticky headers.

---

### 12. **Interactive State Colors**

**Tokens:**
- `--ln-state-hover: rgba(255, 255, 255, 0.08)` — overlay color on hover
- `--ln-state-active: rgba(255, 255, 255, 0.12)` — overlay color on active/pressed
- `--ln-state-disabled: rgba(255, 255, 255, 0.3)` — desaturate/disable appearance
- `--ln-state-focus-ring: var(--ln-cyan)` — focus ring color (keyboard navigation)

**Rationale:**
- State colors are overlays; they layer on top of the base element without changing its hue.
- Hover adds a subtle white wash; active is slightly more opaque.
- Disabled is more opaque to clearly signal unavailability.
- Focus ring uses cyan for high contrast and brand consistency.

---

### 13. **Semantic Color Aliases**

**Tokens:**
- `--ln-color-primary: var(--ln-cyan)` — primary actions, links, focus rings
- `--ln-color-secondary: var(--ln-violet)` — secondary actions, secondary emphasis
- `--ln-color-accent: var(--ln-magenta)` — accent color for high-priority actions
- `--ln-color-success: #00FF41` — success states (bright green, high contrast)
- `--ln-color-warning: #FFD700` — warning states (golden yellow)
- `--ln-color-danger: #FF4444` — error/danger states (bright red)
- `--ln-color-info: var(--ln-cyan)` — informational content (same as primary)

**Rationale:**
- Semantic colors allow components to express intent without hardcoding brand colors.
- Green, yellow, and red are culturally recognized for success/warning/danger.
- These are deliberate departures from the brand palette but necessary for universal usability.

**Accessibility:**
- Never use color alone to communicate state. Pair with icons and text.
- Example: A disabled button should have `color: var(--ln-color-disabled)` AND a disabled icon AND "Disabled" text.

---

## Implementation Rules

### Do's
✅ **Always use tokens.** Never write `color: #00E5FF` — use `color: var(--ln-cyan)`.  
✅ **Use semantic aliases first.** Use `--ln-color-primary` instead of `--ln-cyan` when writing a generic component.  
✅ **Scale spacing and sizing to the token scale.** No arbitrary pixel values (except under 1px borders).  
✅ **Respect reduced-motion.** Test with `prefers-reduced-motion: reduce` and remove animations if needed.  
✅ **Layer glows and shadows.** A button might have `box-shadow: var(--ln-glow-outer)` + `box-shadow: var(--ln-glow-inner)` on active.  

### Don'ts
❌ **Never inline literals.** `color: #00E5FF` is forbidden. Use a token.  
❌ **Never skip the accessibility media queries.** Always test `prefers-reduced-motion` and `prefers-color-scheme`.  
❌ **Never use both glow-outer and glow-inner on default state.** Reserve inner glow for active/focused states to avoid visual overload.  
❌ **Never justify custom spacing values.** If `--ln-space-md` (16px) is too small and `--ln-space-lg` (24px) is too large, the scale needs refinement — raise an issue instead of using 20px.  

---

## Future Extensions

### Phase 1+
- **High-contrast variant:** Add `--ln-*-hc` tokens for WCAG AAA compliance across all states.
- **Light mode:** Add `--ln-surface-bg-light` and adapt color palette for brightness.
- **Component library:** Define composite tokens for buttons, inputs, cards (e.g., `--ln-button-padding: var(--ln-space-md) var(--ln-space-lg)`).
- **Density modes:** Compact, default, and spacious density profiles.
- **Animation presets:** Predefined transition helpers (e.g., `--ln-transition-fade`, `--ln-transition-slide`).

### Adding New Tokens
1. **Never add one-off tokens.** If you need a new color, it should fit into the palette hierarchy (primary, secondary, accent, or semantic).
2. **Reuse before extending.** Can the existing tokens be combined (e.g., `box-shadow` combining `--ln-glow-outer` and `--ln-glow-inner`)?
3. **Document the rationale.** Add an entry to this spec explaining *why* the new token exists and *where* it's used.
4. **Update this file.** Any new token is a system change—it must be approved and documented here before shipping.

---

## Verification Checklist

- [ ] All color values have accessible contrast ratios (test with WebAIM Contrast Checker).
- [ ] Spacing is consistent and scales to the 8px grid.
- [ ] Typography is readable at all sizes (test at 200% zoom).
- [ ] Glows and shadows render cleanly on all target backgrounds.
- [ ] Animations respect `prefers-reduced-motion`.
- [ ] Focus states are clearly visible and keyboard-navigable.
- [ ] The theme is testable in Obsidian's theme sandbox (if applicable).

---

## References

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design Tokens:** https://material.io/design/color/the-color-system.html
- **Tailwind CSS Scale:** https://tailwindcss.com/docs/customizing-colors (inspiration for spacing/sizing)
- **System Design Principles:** Norman's *Design of Everyday Things*

---

**Locked by:** UXDesigner (Principal Product Designer)  
**Approval required for changes:** Yes (Design System governance)

