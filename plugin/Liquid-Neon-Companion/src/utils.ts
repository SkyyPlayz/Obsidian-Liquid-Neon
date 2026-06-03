// Pure utility functions extracted from main.ts so they can be unit/property tested
// without a DOM or Electron environment.

import { resolve as pathResolve, sep } from "path";

/** WCAG AA minimum contrast ratio for normal body text. */
export const WCAG_AA_RATIO = 4.5;

/**
 * Approximate relative luminance of Liquid Neon's off-white body text (#e8e8f0).
 * Using 0.85 as a practical safe value (gamma-corrected sRGB).
 */
export const TEXT_LUMINANCE = 0.85;

/** Converts a gamma-encoded sRGB channel component in [0, 1] to linear light. */
export function sRGBtoLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Maps a lowercase file extension to an image MIME type, defaulting to image/png. */
export function mimeFromExt(ext: string): string {
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/png";
  }
}

/** Extracts the lowercase extension from a file path. Returns "png" if absent. */
export function extFromPath(filePath: string): string {
  return filePath.split(".").pop()?.toLowerCase() ?? "png";
}

/**
 * Pure math: given a 90th-percentile background luminance, returns the black
 * scrim opacity (0–0.85) needed to reach WCAG AA contrast against the theme's
 * body text luminance.
 *
 * Formula: alpha = 1 − requiredBgLum / p90Lum, clamped to [0, 0.85].
 * p90Lum values below 0.001 are treated as near-black — no scrim needed.
 */
export function computeScrimAlphaFromLum(p90Lum: number): number {
  if (p90Lum < 0.001) return 0;
  const requiredBgLum = (TEXT_LUMINANCE + 0.05) / WCAG_AA_RATIO - 0.05;
  if (requiredBgLum < 0) return 0;
  if (p90Lum <= requiredBgLum) return 0;
  const alpha = 1 - requiredBgLum / p90Lum;
  return Math.min(0.85, Math.max(0, alpha));
}

/**
 * Validates an imagePath string before it is passed to fs.readFileSync.
 *
 * Rejects:
 *  - empty string
 *  - paths containing null bytes (POSIX path-traversal via NUL injection)
 *  - paths that do not end in an allowed image extension
 *
 * Note: this does NOT verify the path resolves inside a specific directory —
 * use resolvedInsideRoot() at the call site for the path.resolve + startsWith guard.
 */
export function validateImagePath(filePath: string): boolean {
  if (!filePath) return false;
  if (filePath.includes("\0")) return false;
  const ext = extFromPath(filePath);
  return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
}

/**
 * Returns true if `filePath`, once all `.` and `..` segments are resolved to an
 * absolute path, falls inside `root`. Prevents path-traversal attacks such as
 * `../../../../etc/passwd.png` from escaping an allowed directory.
 *
 * The comparison uses a separator-terminated prefix so that `/home/user` does not
 * accidentally match `/home/username/file.png`.
 */
export function resolvedInsideRoot(filePath: string, root: string): boolean {
  const resolved = pathResolve(filePath);
  const normalizedRoot = root.endsWith(sep) ? root.slice(0, -1) : root;
  return resolved === normalizedRoot || resolved.startsWith(normalizedRoot + sep);
}
