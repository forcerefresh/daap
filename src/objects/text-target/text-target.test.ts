import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/doom-utils/common", () => ({
  nl2br: (s: string) => s,
}));

vi.mock("../json-loader/json-source-connector", () => ({
  JSONSourceConnector: vi.fn(),
}));

import {
  createTextTarget,
  getTextTargetHtml,
  textTargetMeta,
  TEXT_TARGET,
} from "./text-target";

const minimalObject = () => ({
  id: "tt-1",
  definition: {
    values: {
      sourceId: "",
      jsonPath: "",
      sampleText: "Sample text",
      font: { fontFamily: "Arial", source: "system-fonts" },
      color: { r: 255, g: 255, b: 255, a: 1 },
      fontSize: "16px",
      weight: "400",
      italic: false,
      underline: false,
      lineHeight: "",
      textAlign: "left",
      preload: true,
    },
    valuesMetadata: {
      lineHeight: { disabled: true },
    },
  },
});

describe("TEXT_TARGET", () => {
  it("is the expected type string", () => {
    expect(TEXT_TARGET).toBe("text_target");
  });
});

describe("textTargetMeta", () => {
  it("has a name", () => {
    expect(textTargetMeta.name).toBeDefined();
    expect(typeof textTargetMeta.name).toBe("string");
  });
});

describe("createTextTarget", () => {
  it("returns an object with definition type text_target", () => {
    const obj = createTextTarget();
    expect(obj.definition.type).toBe(TEXT_TARGET);
  });

  it("has font and color in values", () => {
    const obj = createTextTarget();
    const vals = obj.definition.values as any;
    expect(vals.font).toBeDefined();
    expect(vals.color).toBeDefined();
  });

  it("does not have autoHeight in values (was removed)", () => {
    const obj = createTextTarget();
    const vals = obj.definition.values as any;
    expect(vals.autoHeight).toBeUndefined();
  });
});

describe("getTextTargetHtml", () => {
  it("returns html with object-content class", () => {
    const result = getTextTargetHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "50px" } as any,
    });
    expect(result).toContain("object-content");
  });

  it("renders sample text in editor mode", () => {
    const result = getTextTargetHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "50px" } as any,
      isPlayer: false,
    });
    expect(result).toContain("Sample text");
  });

  it("renders empty content in player mode", () => {
    const result = getTextTargetHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "50px" } as any,
      isPlayer: true,
    });
    expect(result).not.toContain("Sample text");
  });
});
