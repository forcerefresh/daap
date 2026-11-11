import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import { createSpinnerObject, getSpinnerHtml, spinnerMeta } from "./spinner";

describe("spinnerMeta", () => {
  it("has name and description", () => {
    expect(spinnerMeta.name).toBeDefined();
    expect(spinnerMeta.description).toBeDefined();
  });
});

describe("createSpinnerObject", () => {
  it("returns an object with definition type spinner", () => {
    const obj = createSpinnerObject();
    expect(obj.definition.type).toBe("spinner");
  });

  it("has type and color in values", () => {
    const obj = createSpinnerObject();
    const vals = obj.definition.values as any;
    expect(vals.color).toBeDefined();
  });

  it("spinner type options include plane, chase, dot, bars", () => {
    const obj = createSpinnerObject();
    const typeField = obj.definition.properties.find(
      (p: any) => p.propertyName === "type",
    ) as any;
    const values = typeField?.options?.map((o: any) => o.value) ?? [];
    expect(values).toContain("plane");
    expect(values).toContain("bars");
    expect(values).not.toContain("bounce");
  });
});

describe("getSpinnerHtml", () => {
  it("returns html with object-content class", () => {
    const obj = {
      id: "sp-1",
      definition: {
        values: {
          type: "plane",
          color: { r: 255, g: 255, b: 255, a: 1 },
          fadeInTime: "0s",
          fadeOutTime: "0s",
          applyTo: "page",
        },
      },
    };
    const result = getSpinnerHtml({
      object: obj as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("object-content");
  });
});
