# Liquid Neon Companion

Companion plugin for the **Liquid Neon** Obsidian theme. It handles exactly what the CSS theme alone cannot:

1. **Local background picker** — choose any image file on your machine as the workspace background. Your choice is saved per-vault and survives restarts.
2. **Contrast-guard scrim** — automatically computes a semi-opaque black overlay tuned so body text maintains **≥ 4.5:1** contrast ratio (WCAG AA) over your image, then applies it whenever you change the background.

Everything else — glow intensity, palette overrides, opacity sliders — is handled by the theme's Style Settings controls and is not duplicated here.

---

## Installation

### Community plugins (when available)

1. Open **Settings → Community plugins → Browse**.
2. Search for **Liquid Neon Companion**.
3. Install and enable.

### Manual / development

1. Clone or download this folder into your vault's `.obsidian/plugins/liquid-neon-companion/` directory.
2. Inside that folder, run:

   ```bash
   npm install
   npm run build
   ```

3. Open Obsidian **Settings → Community plugins**, find **Liquid Neon Companion**, and toggle it on.

---

## Usage

1. Open **Settings → Liquid Neon Companion**.
2. Click **Select image…** and choose a PNG, JPEG, WEBP, or GIF file from anywhere on your machine.
3. The background is applied immediately. A contrast-guard scrim is calculated and applied automatically — you will see the scrim opacity reported in the settings panel.
4. To revert to the theme's default background, click **Remove**.

---

## How the contrast guard works

The plugin samples your image at 256 × 256 resolution and computes relative luminance (per WCAG 2.1 §1.4.3) for every pixel. It then takes the **90th-percentile luminance** — the brightness value below which 90 % of the image falls. This represents the kind of bright patch that body text could realistically land on.

A uniform black scrim of opacity **α** reduces effective background luminance to:

```
L_eff = L_bg × (1 − α)
```

The plugin solves for the minimum α such that:

```
contrast(L_text, L_eff) = (L_text + 0.05) / (L_eff + 0.05) ≥ 4.5
```

where `L_text ≈ 0.85` (the relative luminance of Liquid Neon's off-white body text). The computed α is capped at **0.85** to prevent a total blackout, and clamped to 0 when the image is already dark enough.

---

## What this plugin does NOT do

| Feature | Handled by |
|---|---|
| Glow / neon intensity | Style Settings |
| Palette color overrides | Style Settings |
| Default background (`Background1.png`) | `theme.css` |
| Opacity, blur, saturation sliders | Style Settings |

---

## Desktop only

The file picker requires Electron (desktop Obsidian). The plugin loads on mobile but the picker button will not appear.

---

## License

MIT — see the repository root `LICENSE` file.
