import { describe, it, expect } from "vitest";
import { navigationDefinition } from "./navigation-form";

describe("navigationDefinition", () => {
  it("has at least one item", () => {
    expect(navigationDefinition.length).toBeGreaterThan(0);
  });

  it("first item is the navigation type switch group", () => {
    const item = navigationDefinition[0] as any;
    expect(item.propertyName).toBe("navigationType");
  });

  it("does not contain a targetId input", () => {
    const props = navigationDefinition.map((item: any) => item.propertyName);
    expect(props).not.toContain("targetId");
  });

  it("navigation type group has multiple groups (none, link, slide)", () => {
    const item = navigationDefinition[0] as any;
    expect(item.groups.length).toBeGreaterThanOrEqual(3);
  });
});
