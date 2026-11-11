import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: vi.fn((image: any) => image?.url || image?.src || "/img/test.jpg"),
}));

import {
  createImageObject,
  getImageObjectForm,
  getImageHtml,
  getAssetsUrls,
  imageMeta,
  IMAGE,
} from "./image";

const minimalImage = () => ({
  id: "img-1",
  properties: {
    fit: { size: "cover", positionHorizontal: "center", positionVertical: "center" },
    image: { sourceType: "url", url: "https://example.com/img.jpg" },
    preload: false,
  },
  definition: { values: {} },
});

describe("IMAGE", () => {
  it("has the expected type string", () => {
    expect(IMAGE).toBe("io.forcerefresh.image.object");
  });
});

describe("imageMeta", () => {
  it("has a name and description", () => {
    expect(imageMeta.name).toBe("Image");
    expect(imageMeta.description).toBeDefined();
  });
});

describe("createImageObject", () => {
  it("returns an object with image properties", () => {
    const obj = createImageObject();
    expect((obj.properties as any).fit).toBeDefined();
    expect((obj.properties as any).image).toBeDefined();
  });

  it("uses initial value for image if provided", () => {
    const obj = createImageObject({ image: { sourceType: "url", url: "http://x" } });
    expect((obj.properties as any).image.url).toBe("http://x");
  });
});

describe("getImageObjectForm", () => {
  it("returns a form array with fit and image fields", () => {
    const form = getImageObjectForm();
    expect(Array.isArray(form)).toBe(true);
    const names = form.map((f) => f.propertyName);
    expect(names).toContain("fit");
    expect(names).toContain("image");
  });
});

describe("getImageHtml", () => {
  it("returns placeholder when no sourceType", () => {
    const obj = {
      id: "img-2",
      properties: {
        fit: { size: "cover", positionHorizontal: "center", positionVertical: "center" },
        image: {},
      },
    };
    const result = getImageHtml({ object: obj as any, calculatedObjectSize: {} as any });
    expect(result).toContain("placeholder");
  });

  it("returns html string with object-content class when url provided (not player)", () => {
    const obj = minimalImage();
    const result = getImageHtml({
      object: obj as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(typeof result).toBe("string");
    expect(result).toContain("object-content");
  });
});

describe("getAssetsUrls", () => {
  it("returns empty array when no sourceType", () => {
    const result = getAssetsUrls({ values: { image: {} } } as any);
    expect(result).toEqual([]);
  });

  it("returns asset entry with mediaType image", () => {
    const result = getAssetsUrls({
      values: {
        image: { sourceType: "url", url: "http://img.jpg", id: "abc", filename: "img.jpg" },
      },
    } as any);
    expect(result).toHaveLength(1);
    expect(result[0].mediaType).toBe("image");
    expect(result[0].sourceType).toBe("url");
  });
});
