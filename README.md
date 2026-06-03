# Obsidian-Liquid-Neon

A cyberpunk-neon Obsidian theme — electric cyan, violet, and magenta on a deep-black canvas.

<!-- Screenshots placeholder — will be added after SKY-291 nav chrome merges -->

## Color palette

| Token | Value | Role |
|-------|-------|------|
| `--ln-cyan` | `#00F0FF` | Primary accent — links, active items, cursor |
| `--ln-violet` | `#9B5FFF` | Secondary accent — headings, tags |
| `--ln-magenta` | `#FF4DFF` | Tertiary accent — callouts, graph nodes |
| `--ln-bg-0` | `#0A0A0F` | Deepest background (vault chrome) |
| `--ln-bg-1` | `#0F0F18` | Surface (notes, panels) |
| `--ln-bg-2` | `#161626` | Elevated surface (modals, sidebars) |
| `--ln-text` | `#E0E0FF` | Body text |
| `--ln-muted` | `#6060AA` | Dimmed text, metadata |

## Style Settings

Install the **[Style Settings](https://github.com/mgmeyers/obsidian-style-settings)** community plugin to unlock the Liquid Neon configuration panel.

> The theme ships sensible defaults and works without Style Settings installed — every knob below is optional.

### Where the controls appear

After installing Style Settings, open **Settings → Style Settings → Liquid Neon**.

### Available controls

#### Glass & Blur

| Control | What it does |
|---------|-------------|
| **Glass blur amount** (0–40 px) | Backdrop blur applied to all frosted-glass surfaces — ribbon, sidebars, modals, command palette, status bar. |
| **Glass backdrop saturation** (80–200 %) | Saturation multiplier applied alongside the blur. |
| **Glass surface opacity** (0.10–1.00) | Fill opacity of glass chrome. Lower = more transparency; higher = more contrast. |

#### Hover & Focus

| Control | What it does |
|---------|-------------|
| **Hover glow strength** (0–3) | Multiplier for the neon frame spread on hover across every interactive surface. 0 = off. |
| **Hover neon rim opacity** (0–1) | Alpha of the 1 px neon border that appears on hover. |
| **Keyboard-focus ring width** (1–6 px) | Width of the neon ring shown during Tab-key navigation. |

#### Navigation

| Control | What it does |
|---------|-------------|
| **File explorer selection glow** (0–3) | Neon frame intensity for the selected file/folder row. |
| **Active-tab underline width** (1–4 px) | Thickness of the neon underline under the active tab. |

#### Brand Colors

| Control | Default | What it affects |
|---------|---------|-----------------|
| **Neon Cyan** | `#00E5FF` | Tab underlines, focus rings, active selections, scrollbar |
| **Neon Violet** | `#8A2BE2` | Border gradients, scrollbar thumb, graph edges |
| **Neon Magenta** | `#FF2BD6` | Hover frames, gradient endpoints, heading H3 |

Changing any color picker updates accent gradients, hover frames, focus rings, and graph node/edge colors in real time.

#### Graph View

Six color pickers for individual graph node types (default, focused, tag, attachment, unresolved) and edge lines.

#### Accessibility

| Control | What it does |
|---------|-------------|
| **High-contrast mode** | Removes backdrop blur, makes glass surfaces fully opaque, converts neon glows to solid strokes. Targets WCAG AA body text contrast. |
| **Force reduced motion** | Disables all glow-pulse and transition animations regardless of your OS setting. Stacks with the OS-level `prefers-reduced-motion` media query. |

### Defaults without Style Settings

All controls fall back to their defaults — the theme is fully functional and styled out of the box. No Style Settings entry will appear in the settings panel, but the visual experience is unchanged.

### Custom backgrounds and contrast guard

Local-file background images and the automatic contrast-guard scrim require the optional **Liquid Neon Companion** plugin (in the `plugin/` folder). See the [Companion plugin](#companion-plugin) section below.

## Background swap

The optional **Liquid Neon Companion** plugin (in the `plugin/` folder, submitted separately to the community-plugins directory) lets you set a custom background image from **Settings → Liquid Neon Companion**. The plugin also applies an automatic contrast-guard scrim when a bright image is detected. Without the plugin, the default deep-black `--ln-bg-0` is used.

## Install

### Community themes (recommended)
1. Open Obsidian → **Settings → Appearance → Themes → Manage**.
2. Search **"Liquid Neon"** and click **Install and use**.

### Manual install
1. Download `theme.css` and `manifest.json` from the latest release.
2. Copy both files into `<vault>/.obsidian/themes/Liquid-Neon/`.
3. Restart Obsidian and select **Liquid Neon** under **Settings → Appearance → Themes**.

## Companion plugin

The `plugin/Liquid-Neon-Companion/` folder is a placeholder for a small companion plugin that handles features CSS alone cannot provide (tracked in a separate SKY-284 child issue). No action needed during theme installation.

## Attribution

Liquid Neon is built on top of [Obsidian-CyberGlow](https://github.com/thepharaohart/Obsidian-CyberGlow)
by ArtexJay, licensed under the MIT License. Full license text and attribution details are in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Target Obsidian Version

- **Version:** 1.13.0 (Desktop)
- **Release date:** 2026-05-28
- **Source:** [Obsidian changelog](https://obsidian.md/changelog/)

Internal class names drift between Obsidian releases, so all selectors and structural assumptions in this theme are pinned against the version above. Re-snapshot before bumping the target.

## Contributing

Pull requests are welcome. Please open an issue first for significant changes.

## Known limitations

- **Dark mode only (v1).** A light-mode variant is not included. The theme forces dark mode via `body.theme-light { … }` overrides; light-mode users will see a fully dark UI.
- **Graph view: neon colors, light glow.** The graph view is recolored to the Liquid Neon palette (cyan nodes, violet links, magenta tags). The canvas API limits fine-grained shadow effects, so the "glow" is approximated rather than pixel-perfect. See [SKY-292](/SKY/issues/SKY-292) for detail.
- **Obsidian version pin.** Theme selectors are tested against Obsidian **1.13.0**. Internal class names drift between releases; selectors may need a re-snapshot after major upgrades.
- **Companion plugin optional.** Custom background images and the contrast-guard scrim require the Liquid Neon Companion plugin. Without it, all functionality works but the background is the default deep-black.
- **Glass opacity + bright wallpaper contrast.** Setting glass surface opacity below ~0.30 over a bright system wallpaper can drop body text contrast below WCAG AA (4.5:1). The default opacity (0.72) over a dark desktop passes AAA (14:1). If you use a light/white wallpaper, enable **High-contrast mode** in Style Settings — it makes all glass surfaces fully opaque regardless of the opacity slider.

---

## Obsidian Community-Theme Submission Checklist

Before submitting to the [obsidian-releases](https://github.com/obsidianmd/obsidian-releases) community themes list, verify every item below:

- [ ] `manifest.json` present at `theme/Liquid-Neon/manifest.json` with correct `name`, `version`, `minAppVersion`, `author`, `authorUrl`.
- [ ] `theme.css` present at `theme/Liquid-Neon/theme.css`.
- [ ] Theme renders without console errors on the minimum supported Obsidian version.
- [ ] Theme tested in both **light** and **dark** mode (or intentionally dark-only with a note in the description).
- [ ] No hard-coded pixel sizes that break accessibility scaling.
- [ ] Attribution section in README is filled in and any upstream licenses are satisfied.
- [ ] Repository is public on GitHub.
- [ ] PR opened against `obsidianmd/obsidian-releases` following the [contribution guide](https://github.com/obsidianmd/obsidian-releases/blob/master/CONTRIBUTING.md).
