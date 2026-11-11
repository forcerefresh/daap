import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import { createStarObject, getStarHtml, starMeta, STAR } from "./star";

const minimalObject = () => ({
  id: "star-1",
  properties: {
    strokeWidth: "2",
    strokeColor: { r: 255, g: 255, b: 0, a: 1 },
    fill: { r: 255, g: 200, b: 0, a: 1 },
    points: 5,
    radius: 50,
    strokeLineJoin: "miter",
  },
  width: 100,
  height: 100,
});

describe("STAR", () => {
  it("is a non-empty string", () => {
    expect(typeof STAR).toBe("string");
  });
});

describe("starMeta", () => {
  it("has a name", () => {
    expect(starMeta.name).toBeTruthy();
  });
});

describe("createStarObject", () => {
  it("defaults to 5 points", () => {
    const obj = createStarObject();
    expect((obj.properties as any).points).toBe(5);
  });

  it("defaults inner radius to 50", () => {
    const obj = createStarObject();
    expect((obj.properties as any).radius).toBe(50);
  });

  it("accepts custom points and radius", () => {
    const obj = createStarObject({ points: 8, radius: 30 });
    expect((obj.properties as any).points).toBe(8);
    expect((obj.properties as any).radius).toBe(30);
  });
});

describe("getStarHtml", () => {
  it("returns a non-empty string", () => {
    const result = getStarHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the object id", () => {
    const result = getStarHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("star-1");
  });

  it("contains an svg element", () => {
    const result = getStarHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("<svg");
  });
});
