import { describe, it, expect, vi } from "vitest";

import {
  createFreeDrawObject,
  getFreeDrawForm,
  getFreeDrawHtml,
  freeDrawMeta,
  FREE_DRAW,
} from "./free-draw";

const minimalObject = (withBeziers = false) => ({
  id: "fd-1",
  width: 200,
  height: 200,
  properties: {
    beziers: withBeziers
      ? [[[0, 0], [10, 5], [20, 5], [30, 0]]]
      : [],
    strokeWidth: 3,
    color: { r: 255, g: 0, b: 0, a: 1 },
  },
});

describe("FREE_DRAW", () => {
  it("is the expected type string", () => {
    expect(FREE_DRAW).toBe("io.forcerefresh.free-draw.object");
  });
});

describe("freeDrawMeta", () => {
  it("has name and description", () => {
    expect(freeDrawMeta.name).toBe("Free draw");
    expect(freeDrawMeta.description).toBeDefined();
  });
});

describe("createFreeDrawObject", () => {
  it("returns an object with beziers array", () => {
    const obj = createFreeDrawObject();
    expect((obj.properties as any).beziers).toEqual([]);
  });

  it("uses initial values when provided", () => {
    const obj = createFreeDrawObject({ strokeWidth: 10, color: { r: 0, g: 0, b: 0, a: 1 } });
    expect((obj.properties as any).strokeWidth).toBe(10);
  });

  it("does not have a lines property (was removed)", () => {
    const obj = createFreeDrawObject();
    expect((obj.properties as any).lines).toBeUndefined();
  });
});

describe("getFreeDrawForm", () => {
  it("returns form with strokeWidth and color fields", () => {
    const form = getFreeDrawForm();
    expect(Array.isArray(form)).toBe(true);
    const names = form.map((f) => f.propertyName);
    expect(names).toContain("strokeWidth");
    expect(names).toContain("color");
  });
});

describe("getFreeDrawHtml", () => {
  it("returns placeholder in editor with no beziers", () => {
    const result = getFreeDrawHtml({
      object: minimalObject(false) as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(result).toContain("placeholder");
  });

  it("returns svg html with object-content class when beziers present", () => {
    const result = getFreeDrawHtml({
      object: minimalObject(true) as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
      isPlayer: true,
    });
    expect(result).toContain("object-content");
    expect(result).toContain("<svg");
  });
});
