import { describe, it, expect, vi } from "vitest";

vi.mock("./json-source-connector", () => ({
  JSONSourceConnector: vi.fn().mockImplementation(() => ({
    loadData: vi.fn().mockResolvedValue({}),
    getDataByPath: vi.fn().mockResolvedValue(""),
  })),
}));

vi.mock("webslider-sdk/lib/connectors/connector-manager", () => ({
  getOrCreateConnectorById: vi.fn((_Cls: any, _id: string, _sourceId: string) => ({
    loadData: vi.fn().mockResolvedValue({}),
  })),
}));

import {
  createJsonSource,
  getJsonSourceHtml,
  jsonSourceMeta,
  JSON_SOURCE,
} from "./json-source";

describe("jsonSourceMeta", () => {
  it("has name and description", () => {
    expect(jsonSourceMeta.name).toBe("JSON SOURCE");
    expect(jsonSourceMeta.description).toBeDefined();
  });

  it("has preloadOrder defined", () => {
    expect(jsonSourceMeta.preloadOrder).toBeDefined();
  });
});

describe("createJsonSource", () => {
  it("returns an object with definition type json_source", () => {
    const obj = createJsonSource();
    expect(obj.definition.type).toBe(JSON_SOURCE);
  });

  it("has sourceId, url, preload in values", () => {
    const obj = createJsonSource();
    const vals = obj.definition.values as any;
    expect(vals.sourceId).toBe("");
    expect(vals.url).toBe("");
    expect(vals.preload).toBe(true);
  });

  it("has absolute layout", () => {
    const obj = createJsonSource();
    expect((obj as any).layout).toBe("absolute");
  });
});

describe("getJsonSourceHtml", () => {
  it("returns placeholder html in editor mode (isPlayer false)", () => {
    const obj = { id: "js-1", definition: { values: {} } };
    const result = getJsonSourceHtml({
      object: obj as any,
      calculatedObjectSize: {} as any,
      isPlayer: false,
    });
    expect(result).toContain("JSON SOURCE");
  });

  it("returns empty string in player mode", () => {
    const obj = { id: "js-2", definition: { values: {} } };
    const result = getJsonSourceHtml({
      object: obj as any,
      calculatedObjectSize: {} as any,
      isPlayer: true,
    });
    expect(result).toBe("");
  });
});
