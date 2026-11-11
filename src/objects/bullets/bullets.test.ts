import { describe, it, expect, vi } from "vitest";

vi.mock("../../export/export-html", () => ({
  addBorderBox: vi.fn((style: string) => style),
  addPaddingBox: vi.fn((style: string) => style),
}));

vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: vi.fn((_type: string, image: any, _opts: any) => ({
    src: image?.url ?? "",
  })),
}));

vi.mock("./bullets.utils", () => ({
  getImageThumbnailHtml: vi.fn((src: string) => `<img src="${src}" />`),
}));

import {
  createBulletsObject,
  getBulletsHtml,
  getBulletsAssetsUrls,
  bulletsMeta,
  BULLETS,
} from "./bullets";

describe("bulletsMeta", () => {
  it("has name and description", () => {
    expect(bulletsMeta.name).toBe("Bullets");
    expect(bulletsMeta.description).toBeDefined();
  });
});

describe("createBulletsObject", () => {
  it("returns an object with definition type bullets", () => {
    const obj = createBulletsObject();
    expect(obj.definition.type).toBe(BULLETS);
  });

  it("has default bulletsNumber of 3", () => {
    const obj = createBulletsObject();
    const vals = obj.definition.values as any;
    expect(vals.bulletsNumber).toBe(3);
    expect(vals.bulletsType).toBe("bullets");
  });

  it("has commonStyleDefinition and transformDefinition", () => {
    const obj = createBulletsObject();
    expect(obj.commonStyleDefinition).toBeDefined();
    expect(obj.transformDefinition).toBeDefined();
  });
});

describe("getBulletsHtml", () => {
  const baseValues = {
    bulletsType: "bullets",
    bulletsNumber: 3,
    thumbnails: [],
    type: "circle",
    circleWidth: "15px",
    rectWidth: "15px",
    rectHeight: "15px",
    gap: "10px",
    useThumbnails: false,
    thumbnailSize: "200%",
    hasBorder: true,
    borderSize: { common: "3px" },
    borderStyle: "solid",
    borderColor: { r: 0, g: 0, b: 0, a: 1 },
    borderRadius: { common: "0px" },
    hasBackground: true,
    backgroundType: "solid",
    backgroundColor: { r: 140, g: 140, b: 140, a: 1 },
    backgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    backgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
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
    hasActiveBorder: false,
    activeBorderSize: { common: "1px" },
    activeBorderStyle: "solid",
    activeBorderColor: { r: 0, g: 0, b: 0, a: 1 },
    activeBorderRadius: { common: "5px" },
    hasActiveBackground: false,
    activeBackgroundType: "solid",
    activeBackgroundColor: { r: 99, g: 99, b: 99, a: 1 },
    activeBackgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    activeBackgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
  };

  it("returns html containing object-content class", () => {
    const obj = {
      id: "bullets-1",
      definition: { values: baseValues },
      commonStyleDefinition: { values: {}, properties: [] },
      transformDefinition: { values: {}, properties: [] },
    };
    const result = getBulletsHtml({
      object: obj as any,
      calculatedObjectSize: {} as any,
    });
    expect(result).toContain("object-content");
  });

  it("renders bulletsNumber bullet divs for bullets type", () => {
    const obj = {
      id: "bullets-2",
      definition: { values: { ...baseValues, bulletsNumber: 5, type: "circle" } },
      commonStyleDefinition: { values: {}, properties: [] },
      transformDefinition: { values: {}, properties: [] },
    };
    const result = getBulletsHtml({
      object: obj as any,
      calculatedObjectSize: {} as any,
    });
    expect((result.match(/object-content-item-bullets-2/g) || []).length).toBeGreaterThanOrEqual(5);
  });

  it("uses rect dimensions for rectangle type", () => {
    const obj = {
      id: "bullets-3",
      definition: { values: { ...baseValues, type: "rectangle", rectWidth: "30px", rectHeight: "20px" } },
      commonStyleDefinition: { values: {}, properties: [] },
      transformDefinition: { values: {}, properties: [] },
    };
    const result = getBulletsHtml({
      object: obj as any,
      calculatedObjectSize: {} as any,
    });
    expect(result).toContain("width: 30px");
    expect(result).toContain("height: 20px");
  });
});

describe("getBulletsAssetsUrls", () => {
  it("returns empty array for bullets type", () => {
    const result = getBulletsAssetsUrls({
      values: { bulletsType: "bullets", thumbnails: [] },
    } as any);
    expect(result).toEqual([]);
  });

  it("returns asset urls for thumbnails type", () => {
    const result = getBulletsAssetsUrls({
      values: {
        bulletsType: "thumbnails",
        thumbnails: [
          {
            image: { id: "img-1", url: "http://x.com/a.jpg", filename: "a.jpg", sourceType: "upload" },
            filename: "a.jpg",
          },
        ],
      },
    } as any);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("img-1");
  });
});
