import { describe, it, expect } from "vitest";

import {
  createDelayObject,
  getDelayHtml,
  delayMeta,
  delayObject_Start,
} from "./delay";

describe("delayMeta", () => {
  it("has name 'Delay'", () => {
    expect(delayMeta.name).toBe("Delay");
    expect(delayMeta.preloadOrder).toBeDefined();
  });
});

describe("createDelayObject", () => {
  it("returns an object with delay definition", () => {
    const obj = createDelayObject();
    expect(obj.definition.type).toBe("delay");
  });

  it("has delay and preload in values", () => {
    const obj = createDelayObject();
    const vals = obj.definition.values as any;
    expect(vals.delay).toBeDefined();
    expect(vals.preload).toBeDefined();
  });
});

describe("getDelayHtml", () => {
  it("returns placeholder in editor mode", () => {
    const obj = {
      id: "d-1",
      definition: { values: { delay: "2s" } },
    };
    const result = getDelayHtml({
      object: obj as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("DELAY");
  });

  it("returns html div in player mode", () => {
    const obj = {
      id: "d-2",
      definition: { values: { delay: "1s" } },
    };
    const result = getDelayHtml({
      object: obj as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
      isPlayer: true,
    });
    expect(result).toContain("object-content");
  });
});

describe("delayObject_Start", () => {
  it("is a no-op function", () => {
    expect(() => delayObject_Start()).not.toThrow();
  });
});
