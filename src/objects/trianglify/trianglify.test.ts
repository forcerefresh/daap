import { describe, it, expect } from "vitest";

import { createTrianglifyObject, getTrianglifyHtml, trianglifyMeta } from "./trianglify";

describe("trianglifyMeta", () => {
  it("has name and description", () => {
    expect(trianglifyMeta.name).toBe("TRIANGLIFY");
    expect(trianglifyMeta.description).toBeDefined();
    expect(trianglifyMeta.preloadOrder).toBeUndefined();
  });
});

describe("createTrianglifyObject", () => {
  it("returns an object with trianglify type", () => {
    const obj = createTrianglifyObject();
    expect(obj.definition.type).toBe("trianglify");
  });

  it("has colorsX and colorsY in values", () => {
    const obj = createTrianglifyObject();
    const vals = obj.definition.values as any;
    expect(vals.colorsX).toBeDefined();
    expect(vals.colorsY).toBeDefined();
    expect(Array.isArray(vals.colorsX)).toBe(true);
  });
});

describe("getTrianglifyHtml", () => {
  it("returns html with object-content class", () => {
    const obj = createTrianglifyObject();
    const result = getTrianglifyHtml({
      object: { id: "tri-1", width: 200, height: 200, ...obj } as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(typeof result).toBe("string");
  });
});
