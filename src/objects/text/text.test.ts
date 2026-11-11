import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import {
  createTextObject,
  getTextObjectForm,
  getTextHtml,
  getFonts,
  textMeta,
  TEXT,
} from "./text";

const minimalTextObject = () => ({
  id: "text-1",
  properties: {
    text: "Hello",
    type: "body",
    autoHeight: false,
    font: { fontFamily: "Arial", source: "system-fonts", weight: "400" },
    color: { r: 0, g: 0, b: 0, a: 1 },
    fontSize: "16px",
    bold: false,
    italic: false,
    underline: false,
    lineHeight: 0,
    textAlign: "left",
    letterSpacing: "0px",
    fontKerning: true,
    preload: true,
  },
});

describe("TEXT", () => {
  it("has the expected type string", () => {
    expect(TEXT).toBe("io.forcerefresh.text.object");
  });
});

describe("textMeta", () => {
  it("has name and isEditable", () => {
    expect(textMeta.name).toBe("Text");
    expect(textMeta.isEditable).toBe(true);
  });
});

describe("createTextObject", () => {
  it("returns an object with text properties", () => {
    const obj = createTextObject();
    expect((obj.properties as any).font).toBeDefined();
    expect((obj.properties as any).color).toBeDefined();
  });

  it("uses initial values when provided", () => {
    const obj = createTextObject({ text: "Hello World", fontSize: "20px" });
    expect((obj.properties as any).text).toBe("Hello World");
    expect((obj.properties as any).fontSize).toBe("20px");
  });
});

describe("getTextObjectForm", () => {
  it("returns a form array with required fields", () => {
    const form = getTextObjectForm();
    expect(Array.isArray(form)).toBe(true);
    const names = form.map((f) => f.propertyName);
    expect(names).toContain("text");
    expect(names).toContain("font");
    expect(names).toContain("fontSize");
    expect(names).toContain("textAlign");
  });

  it("does not contain a 'type' field (it was removed)", () => {
    const form = getTextObjectForm();
    const names = form.map((f) => f.propertyName);
    expect(names).not.toContain("type");
  });
});

describe("getTextHtml", () => {
  it("returns a p element with object-content class", () => {
    const result = getTextHtml({
      object: minimalTextObject() as any,
      calculatedObjectSize: { width: "200px", height: "50px" } as any,
    });
    expect(result).toContain("<p");
    expect(result).toContain("object-content");
  });

  it("includes the text content", () => {
    const result = getTextHtml({
      object: minimalTextObject() as any,
      calculatedObjectSize: { width: "200px", height: "50px" } as any,
    });
    expect(result).toContain("Hello");
  });

  it("applies italic style when italic is true", () => {
    const obj = {
      ...minimalTextObject(),
      properties: { ...minimalTextObject().properties, italic: true },
    };
    const result = getTextHtml({
      object: obj as any,
      calculatedObjectSize: { width: "200px", height: "50px" } as any,
    });
    expect(result).toContain("font-style: italic");
  });
});

describe("getFonts", () => {
  it("returns empty array for system fonts", () => {
    const result = getFonts({
      values: { font: { fontFamily: "Arial", source: "system-fonts" } },
    } as any);
    expect(result).toEqual([]);
  });

  it("returns font entry for google-fonts source", () => {
    const result = getFonts({
      values: { font: { fontFamily: "Roboto", source: "google-fonts" } },
    } as any);
    expect(result).toHaveLength(1);
    expect(result[0].fontFamily).toBe("Roboto");
  });
});
