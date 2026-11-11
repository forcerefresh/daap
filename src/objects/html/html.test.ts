import { describe, it, expect } from "vitest";

import { createHtmlObject, getHtmlHtml, htmlMeta, HTML } from "./html";

describe("HTML", () => {
  it("is the expected type string", () => {
    expect(HTML).toBe("html-object");
  });
});

describe("htmlMeta", () => {
  it("has name and description", () => {
    expect(htmlMeta.name).toBe("HTML");
    expect(htmlMeta.description).toBeDefined();
  });
});

describe("createHtmlObject", () => {
  it("returns an object with definition type html-object", () => {
    const obj = createHtmlObject();
    expect(obj.definition.type).toBe(HTML);
  });

  it("has html in values", () => {
    const obj = createHtmlObject();
    expect((obj.definition.values as any).html).toBeDefined();
  });
});

describe("getHtmlHtml", () => {
  it("returns placeholder in editor with no html code", () => {
    const obj = {
      id: "html-1",
      definition: { values: { html: { source: "" } } },
    };
    const result = getHtmlHtml({ object: obj as any, calculatedObjectSize: {} as any });
    expect(result).toContain("HTML is not set");
  });

  it("returns html content in player with source", () => {
    const obj = {
      id: "html-2",
      definition: { values: { html: { source: "<p>Hello</p>" } } },
    };
    const result = getHtmlHtml({
      object: obj as any,
      calculatedObjectSize: { width: "200px", height: "100px" } as any,
      isPlayer: true,
    });
    expect(result).toContain("Hello");
    expect(result).toContain("object-content");
  });
});
