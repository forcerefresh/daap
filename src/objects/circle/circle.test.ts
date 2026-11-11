import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import { createCircleObject, getCircleHtml, circleMeta, CIRCLE } from "./circle";

const minimalObject = () => ({
  id: "obj-1",
  properties: {
    strokeWidth: "2",
    strokeColor: { r: 255, g: 0, b: 0, a: 1 },
    type: "color",
    fill: { r: 0, g: 255, b: 0, a: 1 },
  },
  x: 0,
  y: 0,
  width: 100,
  height: 100,
});

describe("CIRCLE", () => {
  it("is a non-empty string", () => {
    expect(typeof CIRCLE).toBe("string");
    expect(CIRCLE.length).toBeGreaterThan(0);
  });
});

describe("circleMeta", () => {
  it("has a name", () => {
    expect(circleMeta.name).toBeTruthy();
  });

  it("has an icon", () => {
    expect(circleMeta.icon).toBeDefined();
  });
});

describe("createCircleObject", () => {
  it("returns an object with properties", () => {
    const obj = createCircleObject();
    expect(obj.properties).toBeDefined();
  });

  it("merges initial values", () => {
    const obj = createCircleObject({ strokeWidth: "5" });
    expect((obj.properties as any).strokeWidth).toBe("5");
  });

  it("applies defaults when called without args", () => {
    const obj = createCircleObject();
    expect((obj.properties as any).strokeWidth).toBeDefined();
  });
});

describe("getCircleHtml", () => {
  it("returns a non-empty string", () => {
    const result = getCircleHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the object id in the output", () => {
    const result = getCircleHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("obj-1");
  });

  it("contains an svg element", () => {
    const result = getCircleHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("<svg");
  });
});
