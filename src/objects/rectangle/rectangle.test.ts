import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import {
  createRectangleObject,
  getRectangleHtml,
  rectangleMeta,
  RECTANGLE,
} from "./rectangle";

const minimalObject = () => ({
  id: "rect-1",
  properties: {
    strokeWidth: "0",
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    fill: { r: 100, g: 100, b: 255, a: 1 },
    cornerRadius: { common: "4px" },
  },
  x: 0,
  y: 0,
  width: 200,
  height: 100,
});

describe("RECTANGLE", () => {
  it("is a non-empty string", () => {
    expect(typeof RECTANGLE).toBe("string");
    expect(RECTANGLE.length).toBeGreaterThan(0);
  });
});

describe("rectangleMeta", () => {
  it("has a name", () => {
    expect(rectangleMeta.name).toBeTruthy();
  });
});

describe("createRectangleObject", () => {
  it("returns an object with properties", () => {
    const obj = createRectangleObject();
    expect(obj.properties).toBeDefined();
  });

  it("uses provided initial strokeWidth", () => {
    const obj = createRectangleObject({ strokeWidth: "8" });
    expect((obj.properties as any).strokeWidth).toBe("8");
  });
});

describe("getRectangleHtml", () => {
  it("returns a non-empty string", () => {
    const result = getRectangleHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "100px" } as any,
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the object id", () => {
    const result = getRectangleHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "100px" } as any,
    });
    expect(result).toContain("rect-1");
  });

  it("contains an svg element", () => {
    const result = getRectangleHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "100px" } as any,
    });
    expect(result).toContain("<svg");
  });
});
