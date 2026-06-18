import { describe, it, expect } from "vitest";
import { computeSoftnessVars } from "../utils";

describe("computeSoftnessVars — boundary values", () => {
  it("value=0 → softest: blur=24px, opacity≈0.58, saturate=160%", () => {
    const vars = computeSoftnessVars(0);
    expect(vars.blur).toBe("24px");
    expect(vars.opacity).toBeCloseTo(0.58);
    expect(vars.saturate).toBe("160%");
  });

  it("value=100 → sharpest: blur=8px, opacity≈0.90, saturate=120%", () => {
    const vars = computeSoftnessVars(100);
    expect(vars.blur).toBe("8px");
    expect(vars.opacity).toBeCloseTo(0.9);
    expect(vars.saturate).toBe("120%");
  });

  it("value=50 → midpoint: blur=16px, opacity≈0.74, saturate=140%", () => {
    const vars = computeSoftnessVars(50);
    expect(vars.blur).toBe("16px");
    expect(vars.opacity).toBeCloseTo(0.74);
    expect(vars.saturate).toBe("140%");
  });
});

describe("computeSoftnessVars — clamping", () => {
  it("value below 0 is clamped to 0 (no extrapolation)", () => {
    const vars = computeSoftnessVars(-10);
    expect(vars.blur).toBe("24px");
    expect(vars.opacity).toBeCloseTo(0.58);
    expect(vars.saturate).toBe("160%");
  });

  it("value above 100 is clamped to 100 (no extrapolation)", () => {
    const vars = computeSoftnessVars(150);
    expect(vars.blur).toBe("8px");
    expect(vars.opacity).toBeCloseTo(0.9);
    expect(vars.saturate).toBe("120%");
  });
});
