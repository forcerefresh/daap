import { describe, it, expect, vi } from "vitest";

vi.mock("../../export/export-html", () => ({
  addBorderBox: vi.fn((style: string) => style),
  addPaddingBox: vi.fn((style: string) => style),
}));

vi.mock("../../utils/doom-utils/common", () => ({
  nl2br: vi.fn((s: string) => s),
}));

import {
  createButtonObject,
  getButtonHtml,
  buttonMeta,
  BUTTON,
} from "./button";

describe("buttonMeta", () => {
  it("has name and description", () => {
    expect(buttonMeta.name).toBe("Button");
    expect(buttonMeta.description).toBeDefined();
  });
});

describe("createButtonObject", () => {
  it("returns an object with definition type button", () => {
    const obj = createButtonObject();
    expect(obj.definition.type).toBe(BUTTON);
  });

  it("has default text Button", () => {
    const obj = createButtonObject();
    const vals = obj.definition.values as any;
    expect(vals.text).toBe("Button");
    expect(vals.sizeType).toBe("padding");
  });

  it("selfSize is true", () => {
    const obj = createButtonObject();
    expect((obj as any).selfSize).toBe(true);
  });
});

describe("getButtonHtml", () => {
  const baseValues = {
    text: "Click me",
    sizeType: "padding",
    sizePadding: { t: "10px", l: "30px", r: "30px", b: "10px" },
    sizeWidth: "200px",
    sizeHeight: "50px",
    font: { fontFamily: "Arial", source: "system-fonts" },
    fontSize: "1em",
    fontColor: { r: 255, g: 255, b: 255, a: 1 },
    fontWeight: "400",
    hasBorder: true,
    borderSize: { common: "1px" },
    borderStyle: "solid",
    borderColor: { r: 0, g: 0, b: 0, a: 1 },
    borderRadius: { common: "5px" },
    hasBackground: true,
    backgroundType: "solid",
    backgroundColor: { r: 99, g: 99, b: 99, a: 1 },
    backgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    backgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
    hasTextShadow: false,
    textShadowDistanceX: "3px",
    textShadowDistanceY: "3px",
    textShadowBlur: "5px",
    textShadowColor: { r: 0, g: 0, b: 0, a: 1 },
    hasBoxShadow: false,
    boxShadowDistanceX: "3px",
    boxShadowDistanceY: "3px",
    boxShadowBlur: "5px",
    boxShadowSpread: "0px",
    boxShadowColor: { r: 0, g: 0, b: 0, a: 1 },
    boxShadowInset: false,
    hasHoverBorder: false,
    hoverBorderSize: { common: "1px" },
    hoverBorderStyle: "solid",
    hoverBorderColor: { r: 0, g: 0, b: 0, a: 1 },
    hoverBorderRadius: { common: "5px" },
    hasHoverBackground: false,
    hoverBackgroundType: "solid",
    hoverBackgroundColor: { r: 99, g: 99, b: 99, a: 1 },
    hoverBackgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    hoverBackgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
    hoverTransitionDuration: 100,
  };

  it("returns html with <button> element", () => {
    const obj = {
      id: "btn-1",
      definition: { values: baseValues },
    };
    const result = getButtonHtml({ object: obj as any });
    expect(result).toContain("<button");
    expect(result).toContain("Click me");
  });

  it("includes font-family in style", () => {
    const obj = {
      id: "btn-2",
      definition: { values: baseValues },
    };
    const result = getButtonHtml({ object: obj as any });
    expect(result).toContain("font-family: Arial");
  });

  it("includes gradient background when backgroundType is gradient", () => {
    const vals = {
      ...baseValues,
      backgroundType: "gradient",
      backgroundGradientColor1: { r: 255, g: 0, b: 0, a: 1 },
      backgroundGradientColor2: { r: 0, g: 0, b: 255, a: 1 },
    };
    const obj = { id: "btn-3", definition: { values: vals } };
    const result = getButtonHtml({ object: obj as any });
    expect(result).toContain("linear-gradient");
  });

  it("includes text-shadow when hasTextShadow is true", () => {
    const vals = {
      ...baseValues,
      hasTextShadow: true,
      textShadowDistanceX: "2px",
      textShadowDistanceY: "2px",
      textShadowBlur: "4px",
      textShadowColor: { r: 0, g: 0, b: 0, a: 0.5 },
    };
    const obj = { id: "btn-4", definition: { values: vals } };
    const result = getButtonHtml({ object: obj as any });
    expect(result).toContain("text-shadow");
  });

  it("uses width/height when sizeType is size", () => {
    const vals = { ...baseValues, sizeType: "size", sizeWidth: "300px", sizeHeight: "80px" };
    const obj = { id: "btn-5", definition: { values: vals } };
    const result = getButtonHtml({ object: obj as any });
    expect(result).toContain("width: 300px");
    expect(result).toContain("height: 80px");
  });
});
