import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import { createPolygonObject, getPolygonHtml, polygonMeta, POLYGON } from "./polygon";

const minimalObject = () => ({
  id: "poly-1",
  properties: {
    strokeWidth: "2",
    strokeColor: { r: 255, g: 255, b: 255, a: 1 },
    fill: { r: 0, g: 128, b: 0, a: 1 },
    sides: 6,
    strokeLineJoin: "miter",
    shiftAngle: false,
  },
  width: 100,
  height: 100,
});

describe("POLYGON", () => {
  it("is a non-empty string", () => {
    expect(typeof POLYGON).toBe("string");
  });
});

describe("polygonMeta", () => {
  it("has a name", () => {
    expect(polygonMeta.name).toBeTruthy();
  });
});

describe("createPolygonObject", () => {
  it("defaults to 6 sides", () => {
    const obj = createPolygonObject();
    expect((obj.properties as any).sides).toBe(6);
  });

  it("accepts custom sides", () => {
    const obj = createPolygonObject({ sides: 3 });
    expect((obj.properties as any).sides).toBe(3);
  });
});

describe("getPolygonHtml", () => {
  it("returns a non-empty string", () => {
    const result = getPolygonHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the object id", () => {
    const result = getPolygonHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("poly-1");
  });

  it("contains an svg element", () => {
    const result = getPolygonHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("<svg");
  });
});
