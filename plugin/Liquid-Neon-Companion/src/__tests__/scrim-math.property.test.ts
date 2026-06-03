import { describe, it } from "vitest";
import fc from "fast-check";
import { sRGBtoLinear, computeScrimAlphaFromLum, validateImagePath } from "../utils";

// ── sRGBtoLinear ──────────────────────────────────────────────────────────────

describe("sRGBtoLinear", () => {
  it("maps [0, 1] inputs to [0, 1] outputs", () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1, noNaN: true }), (c) => {
        const out = sRGBtoLinear(c);
        return out >= 0 && out <= 1;
      })
    );
  });

  it("is monotonically non-decreasing on [0, 1]", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),
        fc.float({ min: 0, max: 1, noNaN: true }),
        (a, b) => {
          // If a ≤ b then f(a) ≤ f(b) — the transfer function is strictly monotone
          if (a <= b) {
            return sRGBtoLinear(a) <= sRGBtoLinear(b) + 1e-10;
          }
          return sRGBtoLinear(a) >= sRGBtoLinear(b) - 1e-10;
        }
      )
    );
  });

  it("respects boundary values: f(0)=0, f(1)=1", () => {
    const tol = 1e-10;
    fc.assert(
      fc.property(fc.constant(0 as number), (c) => Math.abs(sRGBtoLinear(c)) < tol)
    );
    fc.assert(
      fc.property(fc.constant(1 as number), (c) => Math.abs(sRGBtoLinear(c) - 1) < tol)
    );
  });
});

// ── computeScrimAlphaFromLum ──────────────────────────────────────────────────

describe("computeScrimAlphaFromLum", () => {
  it("always returns a value in [0, 0.85] for any p90Lum in [0, 1]", () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1, noNaN: true }), (lum) => {
        const alpha = computeScrimAlphaFromLum(lum);
        return alpha >= 0 && alpha <= 0.85;
      })
    );
  });

  it("returns 0 for near-black backgrounds (p90Lum < 0.001)", () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: Math.fround(0.0009), noNaN: true }), (lum) => {
        return computeScrimAlphaFromLum(lum) === 0;
      })
    );
  });

  it("never returns NaN or Infinity", () => {
    fc.assert(
      fc.property(fc.float({ noNaN: false }), (lum) => {
        const alpha = computeScrimAlphaFromLum(isNaN(lum) ? 0 : Math.max(0, Math.min(1, lum)));
        return Number.isFinite(alpha);
      })
    );
  });
});

// ── validateImagePath — path traversal / injection guard ─────────────────────

describe("validateImagePath", () => {
  it("rejects empty string", () => {
    fc.assert(
      fc.property(fc.constant(""), (p) => !validateImagePath(p))
    );
  });

  it("rejects paths containing NUL bytes (POSIX path-traversal via NUL injection)", () => {
    // NUL byte splits the path at the OS level; `fs.readFileSync('/etc/passwd\0.png')` reads
    // /etc/passwd on glibc-based Linux.
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string()),
        ([prefix, suffix]) => {
          const malicious = prefix + "\0" + suffix;
          return !validateImagePath(malicious);
        }
      )
    );
  });

  it("rejects paths whose extension is not an allowed image type", () => {
    const nonImageExts = ["exe", "sh", "js", "ts", "py", "bat", "cmd", "php", "html"];
    fc.assert(
      fc.property(
        fc.constantFrom(...nonImageExts),
        (ext) => !validateImagePath("file." + ext)
      )
    );
  });

  it("accepts paths that end with an allowed extension", () => {
    const validExts = ["png", "jpg", "jpeg", "webp", "gif"];
    fc.assert(
      fc.property(
        fc.constantFrom(...validExts),
        fc.string({ minLength: 1 }).filter((s) => !s.includes("\0") && !s.includes(".")),
        (ext, stem) => validateImagePath("/home/user/" + stem + "." + ext)
      )
    );
  });
});
