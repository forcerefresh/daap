import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import { createFrameObject, getFrameHtml, frameMeta, FRAME } from "./frame";

describe("FRAME", () => {
  it("is the expected type string", () => {
    expect(FRAME).toBe("frame");
  });
});

describe("frameMeta", () => {
  it("has name and description", () => {
    expect(frameMeta.name).toBe("Frame");
    expect(frameMeta.description).toBeDefined();
  });
});

describe("createFrameObject", () => {
  it("returns a definition with type frame", () => {
    const obj = createFrameObject();
    expect(obj.definition.type).toBe(FRAME);
  });

  it("has commonStyleDefinition and transformDefinition", () => {
    const obj = createFrameObject();
    expect(obj.commonStyleDefinition).toBeDefined();
    expect(obj.transformDefinition).toBeDefined();
  });
});

describe("getFrameHtml", () => {
  it("returns html with object-content class", () => {
    const obj = {
      id: "frame-1",
      definition: { values: {} },
    };
    const result = getFrameHtml({
      object: obj as any,
      calculatedObjectSize: { width: "300px", height: "200px" } as any,
    });
    expect(result).toContain("object-content");
  });
});
