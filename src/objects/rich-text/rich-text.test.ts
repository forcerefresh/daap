import { describe, it, expect, vi } from "vitest";

import {
  createRichTextObject,
  getRichTextHtml,
  richMeta,
  RICH_TEXT,
} from "./rich-text";

describe("RICH_TEXT", () => {
  it("is the expected type string", () => {
    expect(RICH_TEXT).toBe("rich-text-object");
  });
});

describe("richMeta", () => {
  it("has name and description", () => {
    expect(richMeta.name).toBe("Rich Text");
    expect(richMeta.description).toBeDefined();
  });
});

describe("createRichTextObject", () => {
  it("returns an object with definition type rich-text-object", () => {
    const obj = createRichTextObject();
    expect(obj.definition.type).toBe(RICH_TEXT);
  });

  it("has font and color in values", () => {
    const obj = createRichTextObject();
    const vals = obj.definition.values as any;
    expect(vals.font).toBeDefined();
    expect(vals.color).toBeDefined();
    expect(vals.fontSize).toBeDefined();
  });

  it("does not have autoHeight in values (was removed)", () => {
    const obj = createRichTextObject();
    const vals = obj.definition.values as any;
    expect(vals.autoHeight).toBeUndefined();
  });

  it("uses initial text value if provided", () => {
    const obj = createRichTextObject({ text: "<p>Hello</p>" });
    expect((obj.definition.values as any).text).toBe("<p>Hello</p>");
  });
});

describe("getRichTextHtml", () => {
  const obj = () => ({
    id: "rt-1",
    definition: {
      values: {
        text: "<p>Rich content</p>",
        font: { fontFamily: "Arial", source: "system-fonts" },
        color: { r: 255, g: 255, b: 255, a: 1 },
        fontSize: "16px",
      },
      valuesMetadata: {},
    },
  });

  it("returns html with object-content class", () => {
    const result = getRichTextHtml({
      object: obj() as any,
      calculatedObjectSize: { width: "300px", height: "100px" } as any,
    });
    expect(result).toContain("object-content");
  });

  it("includes the text content", () => {
    const result = getRichTextHtml({
      object: obj() as any,
      calculatedObjectSize: { width: "300px", height: "100px" } as any,
    });
    expect(result).toContain("Rich content");
  });

  it("includes a style block", () => {
    const result = getRichTextHtml({
      object: obj() as any,
      calculatedObjectSize: { width: "300px", height: "100px" } as any,
    });
    expect(result).toContain("<style>");
  });
});
