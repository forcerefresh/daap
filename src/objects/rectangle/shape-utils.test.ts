import { describe, it, expect } from "vitest";
import { getSVGFill } from "./shape-utils";

describe("getSVGFill", () => {
  it("returns url() fillAttr and gradient defs for a linear gradient", () => {
    const gradient = {
      points: [
        { stop: 0, color: { r: 255, g: 0, b: 0, a: 1 } },
        { stop: 100, color: { r: 0, g: 0, b: 255, a: 1 } },
      ],
      angle: 90,
    };
    const result = getSVGFill(gradient as any, "obj-1");
    expect(result.fillAttr).toContain("url(");
    expect(result.gradient).toContain("linearGradient");
  });

  it("returns rgba() fillAttr for a plain RGBColor", () => {
    const color = { r: 100, g: 150, b: 200, a: 0.5 };
    const result = getSVGFill(color as any, "obj-2");
    expect(result.fillAttr).toContain("rgba");
    expect(result.gradient).toBeUndefined();
  });

  it("returns transparent fillAttr for undefined", () => {
    const result = getSVGFill(undefined as any, "obj-3");
    expect(result.fillAttr).toContain("transparent");
    expect(result.gradient).toBeUndefined();
  });
});
