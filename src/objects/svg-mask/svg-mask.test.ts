import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: vi.fn((_img: any, _type: any) => null),
}));

vi.mock("../../panels/quick-bar-panel/QuickBarPanel", () => ({
  fetchSVG: vi.fn(() => Promise.resolve("<svg/>")),
}));

vi.mock("../../store/store", () => ({
  store: { getState: vi.fn(() => ({ project: { layers: { layerById: {} }, objects: { objectById: {} } } })) },
}));

vi.mock("../../utils/doom-utils/clip-path", () => ({
  getClipMaskFromSvg: vi.fn(() => "<clipPath/>"),
  getClipMaskFromSvgForExport: vi.fn(() => "<clipPath/>"),
}));

import {
  createSvgMaskObject,
  getSvgMaskObjectForm,
  getSvgMaskHtml,
  getSvgMaskAssetsUrls,
  svgMaskMeta,
  SVG_MASK,
} from "./svg-mask";

describe("SVG_MASK", () => {
  it("has the expected type string", () => {
    expect(SVG_MASK).toBe("io.forcerefresh.svg-mask.object");
  });
});

describe("svgMaskMeta", () => {
  it("has name and description", () => {
    expect(svgMaskMeta.name).toBe("SVG Mask");
    expect(svgMaskMeta.description).toBeDefined();
  });
});

describe("createSvgMaskObject", () => {
  it("returns an object with mask property", () => {
    const obj = createSvgMaskObject();
    expect((obj.properties as any).mask).toBeDefined();
  });

  it("uses initial value for mask if provided", () => {
    const obj = createSvgMaskObject({ mask: { sourceType: "url", url: "http://m.svg" } });
    expect((obj.properties as any).mask.url).toBe("http://m.svg");
  });
});

describe("getSvgMaskObjectForm", () => {
  it("returns a single-element form array", () => {
    const form = getSvgMaskObjectForm();
    expect(form).toHaveLength(1);
    expect(form[0].propertyName).toBe("mask");
  });
});

describe("getSvgMaskHtml", () => {
  it("returns placeholder when no mask in editor", () => {
    const obj = {
      id: "mask-1",
      properties: { mask: {} },
    };
    const result = getSvgMaskHtml({
      object: obj as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
    });
    expect(result).toContain("placeholder");
  });

  it("returns html with object-content class", () => {
    const obj = {
      id: "mask-2",
      properties: { mask: {} },
    };
    const result = getSvgMaskHtml({
      object: obj as any,
      calculatedObjectSize: { width: "100px", height: "100px" } as any,
      isPlayer: true,
    } as any);
    expect(result).toContain("object-content");
  });
});

describe("getSvgMaskAssetsUrls", () => {
  it("returns empty array when no sourceType", () => {
    const result = getSvgMaskAssetsUrls({ values: { mask: {} } } as any);
    expect(result).toEqual([]);
  });

  it("returns one entry with mediaType svg-mask", () => {
    const result = getSvgMaskAssetsUrls({
      values: { mask: { sourceType: "local", id: "abc", filename: "m.svg" } },
    } as any);
    expect(result).toHaveLength(1);
    expect(result[0].mediaType).toBe("svg-mask");
  });
});
