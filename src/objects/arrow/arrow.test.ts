import { describe, it, expect, vi } from "vitest";

vi.mock("../../export/export-html", () => ({
  replaceColors: vi.fn((src: string) => src),
}));

import { createArrowObject, getArrowHtml, arrowMeta } from "./arrow";

const minimalArrowObject = () => ({
  id: "arrow-1",
  definition: {
    id: "def-1",
    type: "arrow",
    properties: [],
    values: {
      svg: {
        source: '<svg><path d="M0 0"/></svg>',
        colors: [],
        colorsType: "unique",
        disableCustomColors: false,
      },
      hasCustomColors: false,
      keepAspectRatio: true,
      hasHover: false,
      hasStrokeFill: false,
      fill: { r: 255, g: 255, b: 255, a: 1 },
      stroke: { r: 0, g: 0, b: 0, a: 0 },
      color: { r: 255, g: 255, b: 255, a: 1 },
      hoverFill: { r: 255, g: 255, b: 255, a: 1 },
      hoverColor: { r: 255, g: 255, b: 255, a: 1 },
      hoverStroke: { r: 0, g: 0, b: 0, a: 0 },
      hoverTransitionDuration: 500,
    },
    valuesMetadata: {
      fill: { disabled: false },
      stroke: { disabled: false },
      color: { disabled: false },
      hoverFill: { disabled: false },
      hoverStroke: { disabled: false },
      hoverColor: { disabled: false },
    },
  },
  width: 50,
  height: 50,
});

describe("arrowMeta", () => {
  it("has a name", () => {
    expect(arrowMeta.name).toBe("Arrow");
  });

  it("has a preloadOrder", () => {
    expect(arrowMeta.preloadOrder).toBeDefined();
  });
});

describe("createArrowObject", () => {
  it("returns an object with a definition", () => {
    const obj = createArrowObject();
    expect(obj.definition).toBeDefined();
    expect(obj.definition.type).toBe("arrow");
  });

  it("includes default svg source", () => {
    const obj = createArrowObject();
    expect((obj.definition.values as any).svg.source).toContain("<svg");
  });

  it("uses provided svg when given initial value", () => {
    const svg = { source: "<svg><circle/></svg>", colors: [], colorsType: "unique", disableCustomColors: false };
    const obj = createArrowObject({ svg });
    expect((obj.definition.values as any).svg.source).toContain("<circle");
  });
});

describe("getArrowHtml", () => {
  it("returns a non-empty string", () => {
    const result = getArrowHtml({
      object: minimalArrowObject() as any,
      calculatedObjectSize: {},
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains a style tag for hover", () => {
    const result = getArrowHtml({
      object: minimalArrowObject() as any,
      calculatedObjectSize: {},
    });
    expect(result).toContain("<style>");
  });

  it("contains the object-content class with the id", () => {
    const result = getArrowHtml({
      object: minimalArrowObject() as any,
      calculatedObjectSize: {},
    });
    expect(result).toContain("object-content-arrow-1");
  });
});
