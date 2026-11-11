import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import { createSvgObject, getSvgHtml, svgMeta, SVG } from "./svg";

const minimalSvgObject = () => ({
  id: "svg-1",
  definition: {
    values: {
      svg: { source: `<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>` },
      keepAspectRatio: true,
      hasCustomColors: false,
      hasFillAndStroke: false,
      fill: { r: 255, g: 255, b: 255, a: 1 },
      stroke: { r: 0, g: 0, b: 0, a: 1 },
      color: { r: 255, g: 255, b: 255, a: 1 },
    },
    valuesMetadata: {
      fill: { disabled: false },
      stroke: { disabled: false },
      color: { disabled: false },
    },
  },
});

describe("SVG", () => {
  it("is the expected type string", () => {
    expect(SVG).toBe("svg");
  });
});

describe("svgMeta", () => {
  it("has name and description", () => {
    expect(svgMeta.name).toBe("SVG");
    expect(svgMeta.description).toBeDefined();
  });
});

describe("createSvgObject", () => {
  it("returns an object with definition", () => {
    const obj = createSvgObject();
    expect(obj.definition).toBeDefined();
    expect(obj.definition.type).toBe(SVG);
  });

  it("has keepAspectRatio defaulting to true", () => {
    const obj = createSvgObject();
    expect((obj.definition.values as any).keepAspectRatio).toBe(true);
  });

  it("uses initial svg value when provided", () => {
    const obj = createSvgObject({ svg: { source: "<svg/>" } });
    expect((obj.definition.values as any).svg.source).toBe("<svg/>");
  });
});

describe("getSvgHtml", () => {
  it("returns placeholder when no svg source (not player)", () => {
    const obj = {
      id: "svg-2",
      definition: {
        values: {
          svg: { source: "" },
          keepAspectRatio: true,
          hasCustomColors: false,
          hasFillAndStroke: false,
        },
        valuesMetadata: {
          fill: { disabled: false },
          stroke: { disabled: false },
          color: { disabled: false },
        },
      },
    };
    const result = getSvgHtml({
      object: obj as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("SVG is not set");
  });

  it("returns html with object-content class for valid svg", () => {
    const result = getSvgHtml({
      object: minimalSvgObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("object-content");
    expect(result).toContain("<svg");
  });

  it("returns html with style block", () => {
    const result = getSvgHtml({
      object: minimalSvgObject() as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(result).toContain("<style>");
  });
});
