import { describe, it, expect, vi } from "vitest";

vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: vi.fn((_type: any, img: any, _opts: any) => ({ src: img?.url || "/img.jpg" })),
}));

import {
  createMultiImageObject,
  getMultiImageHtml,
  getMultiImageAssetsUrls,
  multiImageMeta,
} from "./multiple-images";

const minimalObject = (isPlayer = false) => ({
  id: "mi-1",
  definition: {
    values: {
      fit: { size: "fill", positionHorizontal: "center", positionVertical: "center" },
      images: [
        { image: { sourceType: "url", url: "http://a.jpg", filename: "a.jpg" }, filename: "a.jpg" },
        { image: { sourceType: "url", url: "http://b.jpg", filename: "b.jpg" }, filename: "b.jpg" },
      ],
    },
  },
});

describe("multiImageMeta", () => {
  it("has a name", () => {
    expect(multiImageMeta.name).toBe("Multi Images");
  });
});

describe("createMultiImageObject", () => {
  it("returns an object with definition type multi-image-object", () => {
    const obj = createMultiImageObject();
    expect(obj.definition.type).toBe("multi-image-object");
  });

  it("uses initial images if provided", () => {
    const images = [{ image: { sourceType: "url", url: "http://x.jpg" } }];
    const obj = createMultiImageObject({ images });
    expect((obj.definition.values as any).images).toEqual(images);
  });

  it("has commonStyleDefinition", () => {
    const obj = createMultiImageObject();
    expect(obj.commonStyleDefinition).toBeDefined();
  });
});

describe("getMultiImageHtml", () => {
  it("returns placeholder in editor when no images", () => {
    const obj = {
      id: "mi-2",
      definition: {
        values: {
          fit: { size: "fill", positionHorizontal: "center", positionVertical: "center" },
          images: [],
        },
      },
    };
    const result = getMultiImageHtml({ object: obj as any });
    expect(result).toContain("placeholder");
  });

  it("returns html with object-content for valid images in editor", () => {
    const result = getMultiImageHtml({ object: minimalObject() as any });
    expect(result).toContain("object-content");
    expect(result).toContain("object-content-item");
  });

  it("adds offset styles in editor mode (not player)", () => {
    const result = getMultiImageHtml({ object: minimalObject() as any, isPlayer: false });
    expect(result).toContain("z-index");
  });

  it("does not add offset styles in player mode", () => {
    const result = getMultiImageHtml({ object: minimalObject() as any, isPlayer: true });
    expect(result).not.toContain("z-index");
  });
});

describe("getMultiImageAssetsUrls", () => {
  it("returns one entry per image with sourceType", () => {
    const result = getMultiImageAssetsUrls({
      values: {
        images: [
          { image: { sourceType: "url", url: "http://a.jpg", id: "1" }, filename: "a.jpg" },
          { image: { sourceType: "local", id: "2" }, filename: "b.jpg" },
        ],
      },
    } as any);
    expect(result).toHaveLength(2);
    expect(result[0].mediaType).toBe("image");
  });

  it("returns empty array when images have no sourceType", () => {
    const result = getMultiImageAssetsUrls({
      values: { images: [{ image: {}, filename: "" }] },
    } as any);
    expect(result).toEqual([]);
  });
});
