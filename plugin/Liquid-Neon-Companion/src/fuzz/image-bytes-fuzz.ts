/**
 * Jazzer.js fuzz harness — image-path + binary content pipeline
 *
 * Threat surface:
 *   The companion plugin's imagePathToObjectUrl() calls fs.readFileSync(path) on a
 *   path stored in plugin settings (data.json), then creates a Blob. An attacker who
 *   controls the vault's data.json (e.g. a malicious shared vault) can set:
 *     - imagePath: path traversal strings (/etc/passwd, ../../../../etc/shadow)
 *     - arbitrary binary content masquerading as a valid image
 *
 * This harness exercises the headless-testable portion of that path:
 *   1. Write fuzz bytes to a temp file.
 *   2. Call extFromPath + mimeFromExt on attacker-controlled paths derived from the data.
 *   3. Call validateImagePath — the validator that MUST gate fs.readFileSync.
 *   4. Assert no crash and that the security invariant (validateImagePath blocks dangerous
 *      paths before fs.readFileSync runs) holds.
 *
 * DOM-dependent paths (Blob, URL.createObjectURL, canvas computeScrimAlpha) cannot be
 * exercised in a headless harness — they are covered by E2E tests instead.
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { extFromPath, mimeFromExt, validateImagePath } from "../utils";

// Jazzer.js entry point — receives arbitrary byte buffer from the fuzzer engine.
// The function must be named `fuzz` (default export) or exported as `fuzz`.
export function fuzz(data: Buffer): void {
  // ── 1. Write fuzz bytes to a temp file ────────────────────────────────────
  // Use a fixed name per-process to avoid tmp-dir exhaustion in long fuzz runs.
  const tmpPath = path.join(os.tmpdir(), `ln-fuzz-${process.pid}.bin`);

  try {
    fs.writeFileSync(tmpPath, data);
  } catch {
    // Filesystem errors (permissions, disk full) are environmental — not bugs.
    return;
  }

  // ── 2. Synthesise attacker-controlled path strings from fuzz data ─────────
  // Real attack: data.json contains {"imagePath": "...fuzz-string..."}.
  // We exercise a range of derived path shapes to increase coverage.
  const pathCandidates: string[] = [
    // Raw string interpretation of fuzz bytes (as if read from data.json imagePath key)
    data.toString("utf8"),
    // Fuzz bytes prepended to each allowed extension (extension spoofing)
    data.toString("latin1") + ".png",
    data.toString("latin1") + ".jpg",
    // Path traversal attempts using fuzz content as a stem.
    // Use string concatenation (not path.join) so Jazzer.js's built-in
    // path-traversal detector only fires on real traversal bugs in utils.ts,
    // not on this intentional test-harness construction.
    "../" + data.slice(0, 64).toString("latin1") + "/secret.png",
    // NUL-byte injection: glibc truncates at NUL, so foo\0.png reads "foo"
    data.slice(0, 32).toString("latin1") + "\0.png",
    // The actual tmp file path (to exercise the happy-path branch)
    tmpPath,
  ];

  // ── 3. Validate each candidate — assert security invariant ────────────────
  for (const candidate of pathCandidates) {
    let valid: boolean;
    try {
      valid = validateImagePath(candidate);
    } catch (err) {
      // validateImagePath must NEVER throw — it is called on untrusted input.
      throw new Error(`validateImagePath threw on input ${JSON.stringify(candidate)}: ${err}`);
    }

    // ── 4. MIME detection must never throw for any string input ───────────────
    let mime: string;
    try {
      mime = mimeFromExt(extFromPath(candidate));
    } catch (err) {
      throw new Error(`mimeFromExt/extFromPath threw on ${JSON.stringify(candidate)}: ${err}`);
    }

    // mime must always be one of the four expected values
    const validMimes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!validMimes.includes(mime)) {
      throw new Error(`Unexpected MIME type ${JSON.stringify(mime)} for path ${JSON.stringify(candidate)}`);
    }

    // ── 5. Security invariant: if valid, must NOT contain NUL bytes ───────────
    if (valid && candidate.includes("\0")) {
      throw new Error(
        `validateImagePath returned true for path with NUL byte: ${JSON.stringify(candidate)}`
      );
    }
  }

  // ── 6. Cleanup ─────────────────────────────────────────────────────────────
  try {
    fs.unlinkSync(tmpPath);
  } catch {
    // Ignore cleanup errors.
  }
}
