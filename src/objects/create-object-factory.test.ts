import { describe, it, expect, vi } from "vitest";

vi.mock("./svg/svg", () => ({
  createSvgObject: vi.fn(() => ({ objectType: "svg" })),
  SVG: "svg",
}));

vi.mock("webslider-sdk/lib/objects/objects-register", () => ({
  getAppObjectDefinition: vi.fn((_type: string) => ({
    createObject: vi.fn(() => ({ objectType: _type })),
    version: "1.0.0",
  })),
}));

vi.mock("webslider-sdk/lib/objects/create-common-object", () => ({
  createCommonObject: vi.fn((type: string) => ({ objectType: type })),
}));

vi.mock("webslider-sdk/lib/objects/transform-properties", () => ({
  getTransformObjectPropertiesDefinition: vi.fn(() => []),
  getTransformPropertiesValues: vi.fn(() => ({})),
}));

import {
  getDefaultTransitionsForLayer,
  getDefaultTransitionsForSlide,
  getBorderOptions,
  getDefaultSlide,
} from "./create-object-factory";
import { PageType } from "../store/reducers/i-pages";

describe("getDefaultTransitionsForLayer", () => {
  it("returns an object with in, out, and layer arrays", () => {
    const t = getDefaultTransitionsForLayer();
    expect(Array.isArray(t.in)).toBe(true);
    expect(Array.isArray(t.out)).toBe(true);
    expect(Array.isArray(t.layer)).toBe(true);
  });
});

describe("getDefaultTransitionsForSlide", () => {
  it("returns an object with a slide array", () => {
    const t = getDefaultTransitionsForSlide();
    expect(Array.isArray(t.slide)).toBe(true);
  });
});

describe("getBorderOptions", () => {
  it("returns an array with 10 border style options", () => {
    const opts = getBorderOptions();
    expect(opts).toHaveLength(10);
  });

  it("each option has a label and value", () => {
    getBorderOptions().forEach((opt) => {
      expect(opt.label).toBeTruthy();
      expect(opt.value).toBeTruthy();
    });
  });

  it("includes solid and none", () => {
    const opts = getBorderOptions();
    expect(opts.some((o) => o.value === "solid")).toBe(true);
    expect(opts.some((o) => o.value === "none")).toBe(true);
  });
});

describe("getDefaultSlide", () => {
  it("returns a slide with an id, layerIds, and nextLayerNameNumber", () => {
    const slide = getDefaultSlide(PageType.Normal, "Test Slide");
    expect(typeof slide.id).toBe("string");
    expect(slide.id.length).toBeGreaterThan(0);
    expect(Array.isArray(slide.layerIds)).toBe(true);
    expect(slide.nextLayerNameNumber).toBe(1);
  });

  it("sets the name when provided", () => {
    const slide = getDefaultSlide(PageType.Normal, "My Slide");
    expect(slide.name).toBe("My Slide");
  });

  it("does not add a type field for Normal pages", () => {
    const slide = getDefaultSlide(PageType.Normal);
    expect(slide.type).toBeUndefined();
  });

  it("adds a type field for non-Normal page types", () => {
    const slide = getDefaultSlide(PageType.Popup);
    expect(slide.type).toBe(PageType.Popup);
  });
});
