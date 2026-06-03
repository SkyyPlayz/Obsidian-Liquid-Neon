# Untrusted-Input Inventory — Obsidian Liquid Neon

**Scope:** Companion plugin (`plugin/Liquid-Neon-Companion/`) only.  
**Theme CSS surfaces** (purely declarative; no runtime parser) are out of scope.  
**Last updated:** 2026-06-03 (SKY-580)

---

## 1. `imagePath` — file-picker path stored in settings

| Field | Value |
|-------|-------|
| **File** | `plugin/Liquid-Neon-Companion/main.ts` |
| **Line** | `main.ts:52` — `buf = fs.readFileSync(path)` |
| **Source** | `main.ts:45` — `private async imagePathToObjectUrl(path: string)` |
| **Origin** | Obsidian file picker dialog (desktop only); persisted to `data.json` |
| **Trust boundary crossed** | Filesystem read. Path comes from Obsidian's native dialog but is persisted via Obsidian's `loadData()` / `saveData()` (JSON in vault's `.obsidian/plugins/liquid-neon-companion/data.json`) |
| **Risk** | **Path traversal.** A malicious shared vault can set `imagePath` to `../../../../etc/passwd` or any other arbitrary path. `fs.readFileSync` will follow the path without validation. Extension-based MIME detection (line 60–67) is also bypass-able via double extension: `evil.sh.png`. |
| **Exploit class** | CWE-22 (Path Traversal), CWE-73 (External Control of File Name/Path) |
| **Current mitigation** | `validateImagePath()` blocks NUL-byte injection and non-image extensions. `resolvedInsideRoot()` (added in SKY-580) resolves all `..` segments and verifies the result starts within `os.homedir()`, closing the path-traversal gap. Both checks run in `imagePathToObjectUrl` before `fs.readFileSync`. |
| **Required fix** | ~~Fixed in SKY-580.~~ No further action required for path traversal. |
| **Property test** | `src/__tests__/scrim-math.property.test.ts` — `validateImagePath` suite; `src/__tests__/settings-roundtrip.property.test.ts` — `resolvedInsideRoot` SKY-580 regression suite |
| **Fuzz harness** | `src/fuzz/image-bytes-fuzz.ts` |

---

## 2. Plugin settings JSON — `data.json` deserialization

| Field | Value |
|-------|-------|
| **File** | `plugin/Liquid-Neon-Companion/main.ts` |
| **Line** | `main.ts:148` — `await this.loadData()` in `loadSettings()` |
| **Source** | Obsidian's `Plugin.loadData()` reads `.obsidian/plugins/liquid-neon-companion/data.json` |
| **Origin** | Obsidian vault filesystem — attacker-controlled if vault is shared |
| **Trust boundary crossed** | `Object.assign({}, DEFAULT_SETTINGS, await this.loadData())` merges untyped JSON into typed settings without schema validation |
| **Risk** | **Type confusion / schema violation.** An attacker can set `scrimAlpha` to a string (`"evil"`) causing `alpha.toFixed(3)` to throw; `imagePath` to a number causing downstream code to receive a non-string path. |
| **Exploit class** | CWE-20 (Improper Input Validation), CWE-843 (Type Confusion) |
| **Current mitigation** | None — `Object.assign` silently passes through wrong types. |
| **Required fix** | Validate loaded data against the `LiquidNeonSettings` schema: check `typeof imagePath === "string"` and `typeof scrimAlpha === "number" && isFinite(scrimAlpha) && scrimAlpha >= 0 && scrimAlpha <= 1` before use. |
| **Property test** | `src/__tests__/settings-roundtrip.property.test.ts` — schema safety suite |
| **Fuzz harness** | `src/fuzz/image-bytes-fuzz.ts` (generates attacker-shaped path candidates) |

---

## 3. MIME type detection — extension parsing

| Field | Value |
|-------|-------|
| **File** | `plugin/Liquid-Neon-Companion/main.ts` |
| **Line** | `main.ts:55` — `const ext = path.split(".").pop()?.toLowerCase() ?? "png"` |
| **Source** | `imagePath` from settings (see surface 1 above) |
| **Trust boundary crossed** | Extension used to select MIME type for `Blob` constructor |
| **Risk** | **Double-extension bypass.** `evil.sh.png` → `ext = "png"` → `Blob` gets `image/png` type but content is a shell script. The OS may re-identify by content; however, combined with a future server-side upload feature this would be a file-upload bypass. Low severity in current desktop-only context. |
| **Exploit class** | CWE-434 (Unrestricted Upload of File with Dangerous Type) — future risk |
| **Current mitigation** | Extension allowlist in `validateImagePath()` (`src/utils.ts:56`). |
| **Required fix** | Add content-type sniffing (magic bytes check) when a server upload feature lands. Tracked as future risk. |
| **Property test** | `src/__tests__/scrim-math.property.test.ts` — `validateImagePath` extension rejection test |

---

## 4. `sRGBtoLinear` — pixel data from rendered canvas

| Field | Value |
|-------|-------|
| **File** | `plugin/Liquid-Neon-Companion/main.ts` |
| **Line** | `main.ts:115` — `sRGBtoLinear(data[i] / 255)` inside `computeScrimAlpha` |
| **Source** | `ImageData.data` from `ctx.getImageData()` on a canvas rendering `img.src = objectUrl` |
| **Origin** | Pixel bytes decoded from the user-chosen image file |
| **Trust boundary crossed** | Attacker-controlled image bytes → canvas pixel decode → luminance math |
| **Risk** | **Low.** `sRGBtoLinear` is pure math on `number` inputs; canvas always returns `Uint8ClampedArray` in [0, 255]. The result feeds only a CSS `rgba()` opacity value, so the worst case is an incorrect scrim opacity. No code execution path. |
| **Exploit class** | N/A (data-only influence on visual rendering) |
| **Current mitigation** | `Math.min(0.85, Math.max(0, alpha))` clamps the output. |
| **Property test** | `src/__tests__/scrim-math.property.test.ts` — `sRGBtoLinear` and `computeScrimAlphaFromLum` suites |

---

## Residual risks and follow-ups

1. ~~**`..` path traversal not blocked by `validateImagePath`.**~~ **Fixed in [SKY-580](/SKY/issues/SKY-580).** `resolvedInsideRoot()` added to `src/utils.ts`; guard wired in `imagePathToObjectUrl` before `fs.readFileSync`. Regression suite in `settings-roundtrip.property.test.ts`.
2. **`scrimAlpha` type confusion** on `Object.assign` — no schema validator added yet. Property test documents the gap (commented-out assertion in `settings-roundtrip.property.test.ts`).
3. **DOM-dependent surfaces** (`computeScrimAlpha` canvas path, `Blob`, `URL.createObjectURL`) cannot be exercised by the headless fuzz harness. E2E coverage is deferred to integration test work.

---

*Inventory maintained by SecurityEngineer. See [SKY-373](/SKY/issues/SKY-373) and [SKY-580](/SKY/issues/SKY-580) for context.*
