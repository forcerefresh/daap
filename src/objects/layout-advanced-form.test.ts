import { describe, it, expect } from "vitest";
import { layoutAdvancedDefinition } from "./layout-advanced-form";

describe("layoutAdvancedDefinition", () => {
  it("has exactly one form group item", () => {
    expect(layoutAdvancedDefinition).toHaveLength(1);
  });

  it("has the expected propertyName", () => {
    expect(layoutAdvancedDefinition[0].propertyName).toBe("hasLayoutAdvance");
  });

  it("contains updateSize and updateScale checkboxes", () => {
    const elements = layoutAdvancedDefinition[0].elements;
    const names = elements.map((e: any) => e.propertyName);
    expect(names).toContain("updateSize");
    expect(names).toContain("updateScale");
  });
});
