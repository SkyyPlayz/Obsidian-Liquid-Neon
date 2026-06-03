import { App, Notice, Platform, Plugin, PluginSettingTab, Setting } from "obsidian";
import {
  WCAG_AA_RATIO,
  TEXT_LUMINANCE,
  sRGBtoLinear,
  mimeFromExt,
  extFromPath,
  computeScrimAlphaFromLum,
  validateImagePath,
} from "./src/utils";

interface LiquidNeonSettings {
  imagePath: string;
  scrimAlpha: number;
}

const DEFAULT_SETTINGS: LiquidNeonSettings = {
  imagePath: "",
  scrimAlpha: 0,
};

export default class LiquidNeonCompanion extends Plugin {
  settings!: LiquidNeonSettings;

  private styleEl: HTMLStyleElement | null = null;
  private scrimEl: HTMLElement | null = null;
  private objectUrl: string | null = null;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new LiquidNeonSettingTab(this.app, this));
    await this.applyBackground();
  }

  onunload() {
    this.cleanup();
  }

  // ── Public surface (called from the settings tab) ──────────────────────────

  async applyBackground(): Promise<void> {
    this.cleanup();

    if (!this.settings.imagePath) return;

    const url = await this.imagePathToObjectUrl(this.settings.imagePath);
    if (!url) return;
    this.objectUrl = url;

    this.injectBackgroundCss(url);

    const alpha = await this.computeScrimAlpha(url);
    this.settings.scrimAlpha = alpha;
    await this.saveSettings();

    this.injectScrim(alpha);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private cleanup(): void {
    this.styleEl?.remove();
    this.styleEl = null;

    this.scrimEl?.remove();
    this.scrimEl = null;

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private async imagePathToObjectUrl(filePath: string): Promise<string | null> {
    if (!validateImagePath(filePath)) {
      new Notice("Liquid Neon Companion: Image path is invalid or disallowed.");
      return null;
    }

    // Node fs is available in the Electron renderer via require().
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs") as typeof import("fs");
    let buf: Buffer;
    try {
      buf = fs.readFileSync(filePath);
    } catch {
      new Notice("Liquid Neon Companion: Could not read background image.");
      return null;
    }

    const mime = mimeFromExt(extFromPath(filePath));
    const blob = new Blob([buf], { type: mime });
    return URL.createObjectURL(blob);
  }

  private injectBackgroundCss(url: string): void {
    this.styleEl = document.createElement("style");
    this.styleEl.id = "liquid-neon-companion-bg";
    // Override only the CSS variable the theme reads; everything else (size,
    // position, attachment) is already set by theme.css on body.theme-dark.
    this.styleEl.textContent = `body.theme-dark { --ln-bg-image: url("${url}"); }`;
    document.head.appendChild(this.styleEl);
  }

  private injectScrim(alpha: number): void {
    if (alpha <= 0) return;

    this.scrimEl = document.createElement("div");
    this.scrimEl.id = "liquid-neon-companion-scrim";
    this.scrimEl.setAttribute("aria-hidden", "true");
    Object.assign(this.scrimEl.style, {
      position: "fixed",
      inset: "0",
      // The scrim layer sits above the raw background but below Obsidian's app
      // chrome (which lives at z-index 10+).
      zIndex: "1",
      pointerEvents: "none",
      backgroundColor: `rgba(0,0,0,${alpha.toFixed(3)})`,
      // Transition so it fades in instead of popping (respects prefers-reduced-motion
      // via the Obsidian body class set by the theme).
      transition: "background-color 0.4s ease",
    });
    document.body.prepend(this.scrimEl);
  }

  // Returns the scrim alpha needed to bring image background to WCAG AA ≥4.5:1
  // contrast against the theme's body text.
  //
  // A uniform black scrim of opacity α darkens the background luminance:
  //   L_eff = L_bg × (1 − α)
  // Solving for α so that contrast(L_text, L_eff) ≥ 4.5:
  //   α = 1 − requiredBgLum / L_bg_avg
  // where requiredBgLum = (L_text + 0.05) / 4.5 − 0.05
  //
  // We sample at the 90th-percentile luminance (brightest decile) rather than
  // the average, because text may land on a bright patch and the worst-case
  // patch is what sets the a11y floor.
  private computeScrimAlpha(imageUrl: string): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Sample at a bounded canvas size for performance.
        const W = Math.min(img.naturalWidth, 256);
        const H = Math.min(img.naturalHeight, 256);
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(0);

        ctx.drawImage(img, 0, 0, W, H);
        const { data } = ctx.getImageData(0, 0, W, H);

        // Build a sorted array of per-pixel relative luminance values.
        const lums: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = sRGBtoLinear(data[i] / 255);
          const g = sRGBtoLinear(data[i + 1] / 255);
          const b = sRGBtoLinear(data[i + 2] / 255);
          lums.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
        }
        lums.sort((a, b) => a - b);

        // 90th-percentile luminance — the representative "bright patch" value.
        const p90Lum = lums[Math.floor(lums.length * 0.9)] ?? 0;
        resolve(computeScrimAlphaFromLum(p90Lum));
      };
      img.onerror = () => resolve(0);
      img.src = imageUrl;
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

// ── Settings tab ──────────────────────────────────────────────────────────────

class LiquidNeonSettingTab extends PluginSettingTab {
  plugin: LiquidNeonCompanion;

  constructor(app: App, plugin: LiquidNeonCompanion) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Liquid Neon Companion" });
    containerEl.createEl("p", {
      text: "Controls that the CSS theme alone cannot provide: a local background image and an automatic contrast-guard scrim.",
      cls: "setting-item-description",
    });

    // ── Background picker ─────────────────────────────────────────────────────
    const pickerSetting = new Setting(containerEl)
      .setName("Background image")
      .setDesc(
        "Pick a local image file (PNG, JPEG, WEBP, GIF) to use as the workspace background instead of the default cosmic BG shipped by the theme."
      );

    if (!Platform.isDesktopApp) {
      pickerSetting.setDesc(
        "Background picker requires the Obsidian desktop app."
      );
    } else {
      pickerSetting.addButton((btn) =>
        btn
          .setButtonText(
            this.plugin.settings.imagePath ? "Change image…" : "Select image…"
          )
          .onClick(async () => {
            const path = await openFilePicker();
            if (!path) return;
            this.plugin.settings.imagePath = path;
            await this.plugin.saveSettings();
            await this.plugin.applyBackground();
            this.display();
          })
      );
    }

    // ── Current image info ────────────────────────────────────────────────────
    if (this.plugin.settings.imagePath) {
      new Setting(containerEl)
        .setName("Current image")
        .setDesc(this.plugin.settings.imagePath)
        .addButton((btn) =>
          btn
            .setButtonText("Remove")
            .setWarning()
            .onClick(async () => {
              this.plugin.settings.imagePath = "";
              this.plugin.settings.scrimAlpha = 0;
              await this.plugin.saveSettings();
              await this.plugin.applyBackground();
              this.display();
            })
        );

      const pct = (this.plugin.settings.scrimAlpha * 100).toFixed(1);
      new Setting(containerEl)
        .setName("Contrast scrim")
        .setDesc(
          `Auto-computed black overlay at ${pct}% opacity. ` +
            `Applied so that body text achieves WCAG AA ≥4.5:1 contrast ` +
            `over the brightest decile of your background image. ` +
            `Recomputed automatically whenever you change the image.`
        );
    }
  }
}

// ── File picker (desktop only) ────────────────────────────────────────────────

async function openFilePicker(): Promise<string | null> {
  // Obsidian 1.x ships @electron/remote; older builds expose electron.remote.
  // We try both to stay compatible across vault migrations.
  let dialog: { showOpenDialog: (opts: object) => Promise<{ canceled: boolean; filePaths: string[] }> };
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    dialog = require("@electron/remote").dialog;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    dialog = require("electron").remote.dialog;
  }

  const result = await dialog.showOpenDialog({
    title: "Select background image",
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "gif"] },
    ],
    properties: ["openFile"],
  });

  return result.canceled ? null : result.filePaths[0] ?? null;
}

// Re-export for consumers that may import directly (e.g. the esbuild bundle).
export { WCAG_AA_RATIO, TEXT_LUMINANCE };
