import { describe, it, expect } from "vitest";
import TextTool, { getCursorStyle } from "./text-tool";

describe("getCursorStyle", () => {
  it("returns 'text'", () => {
    expect(getCursorStyle()).toBe("text");
  });
});

describe("TextTool", () => {
  it("can be instantiated", () => {
    const tool = new TextTool();
    expect(tool).toBeDefined();
  });

  it("has required IToolClass methods", () => {
    const tool = new TextTool();
    expect(typeof tool.activate).toBe("function");
    expect(typeof tool.deactivate).toBe("function");
    expect(typeof tool.editorChange).toBe("function");
    expect(typeof tool.toolConfigChange).toBe("function");
    expect(typeof tool.objectsChange).toBe("function");
  });

  it("toolConfigChange is a no-op", () => {
    const tool = new TextTool();
    expect(() => tool.toolConfigChange({})).not.toThrow();
  });

  it("objectsChange is a no-op", () => {
    const tool = new TextTool();
    expect(() => tool.objectsChange([])).not.toThrow();
  });
});
