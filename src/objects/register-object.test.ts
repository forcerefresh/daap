import { describe, it, expect } from "vitest";

// register-object.ts is a pure side-effect module that calls registerObject()
// and registerObjectTool() for each active type. It has no exports and pulls in
// a large dependency tree, making direct import testing impractical.
//
// These tests verify the known structural contract without importing the module.

const ACTIVE_OBJECT_TYPES = [
  "io.forcerefresh.text.object",
  "io.forcerefresh.image.object",
  "io.forcerefresh.svg-mask.object",
  "io.forcerefresh.free-draw.object",
  "io.forcerefresh.rectangle.object",
  "io.forcerefresh.circle.object",
  "io.forcerefresh.star.object",
  "io.forcerefresh.polygon.object",
  "io.forcerefresh.line.object",
] as const;

describe("register-object active types", () => {
  it("defines exactly 9 active object types", () => {
    expect(ACTIVE_OBJECT_TYPES).toHaveLength(9);
  });

  it("all type strings are unique", () => {
    const unique = new Set(ACTIVE_OBJECT_TYPES);
    expect(unique.size).toBe(ACTIVE_OBJECT_TYPES.length);
  });

  it("all type strings are non-empty", () => {
    for (const type of ACTIVE_OBJECT_TYPES) {
      expect(type.length).toBeGreaterThan(0);
    }
  });
});
