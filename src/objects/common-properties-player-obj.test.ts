import { describe, it, expect } from "vitest";
import {
  addBorderRadius_CSSProperties,
  addBackgroundColor_CSSProperties,
  addClipMask_CSSProperties,
  addPaddingColor_CSSProperties,
  addBorder_CSSProperties,
  addBorderSide_CSSProperties,
} from "./common-properties-player-obj";
import { CSSProperties } from "react";

describe("addBorderRadius_CSSProperties", () => {
  it("sets borderRadius from common value", () => {
    const css: CSSProperties = {};
    addBorderRadius_CSSProperties(css, { common: "8px" } as any);
    expect(css.borderRadius).toBe("8px");
  });

  it("sets borderRadius from per-side values", () => {
    const css: CSSProperties = {};
    addBorderRadius_CSSProperties(css, { tl: "4px", tr: "4px", br: "4px", bl: "4px" } as any);
    expect(css.borderRadius).toBe("4px 4px 4px 4px");
  });

  it("does nothing when no values set", () => {
    const css: CSSProperties = {};
    addBorderRadius_CSSProperties(css, {} as any);
    expect(css.borderRadius).toBeUndefined();
  });
});

describe("addBackgroundColor_CSSProperties", () => {
  it("sets backgroundColor from RGBColor", () => {
    const css: CSSProperties = {};
    addBackgroundColor_CSSProperties(css, { r: 255, g: 0, b: 0, a: 1 } as any);
    expect(css.backgroundColor).toBeTruthy();
  });

  it("does not set backgroundColor when no color provided", () => {
    const css: CSSProperties = {};
    addBackgroundColor_CSSProperties(css, null as any);
    expect(css.backgroundColor).toBeUndefined();
  });
});

describe("addClipMask_CSSProperties", () => {
  it("sets clipPath polygon from points", () => {
    const css: CSSProperties = {};
    addClipMask_CSSProperties(css, {
      point: [
        { x: "0%", y: "0%" },
        { x: "100%", y: "0%" },
        { x: "100%", y: "100%" },
      ],
    } as any);
    expect(css.clipPath).toContain("polygon");
  });

  it("does nothing when no clip mask provided", () => {
    const css: CSSProperties = {};
    addClipMask_CSSProperties(css, null as any);
    expect(css.clipPath).toBeUndefined();
  });
});

describe("addPaddingColor_CSSProperties", () => {
  it("sets padding in px when value provided", () => {
    const css: CSSProperties = {};
    addPaddingColor_CSSProperties(css, 12);
    expect(css.padding).toBe("12px");
  });

  it("does not set padding when value is 0", () => {
    const css: CSSProperties = {};
    addPaddingColor_CSSProperties(css, 0);
    expect(css.padding).toBeUndefined();
  });
});

describe("addBorder_CSSProperties", () => {
  it("uses common border values when useCommonValue is true", () => {
    const css: CSSProperties = {};
    addBorder_CSSProperties(css, {
      useCommonValue: true,
      commonBorder: {
        width: "2px",
        color: { r: 0, g: 0, b: 0, a: 1 },
        style: "solid",
      },
    } as any);
    expect(css.borderWidth).toBe("2px");
    expect(css.borderStyle).toBe("solid");
  });

  it("applies per-side borders when useCommonValue is false", () => {
    const css: CSSProperties = {};
    const side = { width: "1px", color: { r: 0, g: 0, b: 0, a: 1 }, style: "solid" };
    addBorder_CSSProperties(css, {
      useCommonValue: false,
      top: side,
      bottom: side,
      left: side,
      right: side,
    } as any);
    expect((css as any).borderTopWidth).toBe("1px");
    expect((css as any).borderBottomWidth).toBe("1px");
  });
});

describe("addBorderSide_CSSProperties", () => {
  it("sets width, color and style for the specified side", () => {
    const css: CSSProperties = {};
    addBorderSide_CSSProperties(css, "Left", {
      width: "3px",
      color: { r: 100, g: 100, b: 100, a: 1 },
      style: "dashed",
    } as any);
    expect((css as any).borderLeftWidth).toBe("3px");
    expect((css as any).borderLeftStyle).toBe("dashed");
  });
});
