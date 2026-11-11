import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: vi.fn((_type: any, _media: any, _opts: any) => ({ src: "http://video.mp4" })),
}));

import { createVideoObject, getVideoHtml, videoMeta, VIDEO } from "./video";

const minimalVideoObject = () => ({
  id: "vid-1",
  definition: {
    values: {
      videoFit: { size: "fill", positionHorizontal: "center", positionVertical: "center" },
      video: { video: { sourceType: "url", url: "http://test.mp4" }, filename: "test.mp4", previewImage: {} },
      controls: false,
      muted: true,
      loop: false,
      playsinline: true,
      preload: "auto",
      autoplay: false,
      volume: 50,
      delayTime: "0ms",
      initialTime: "0ms",
    },
  },
});

describe("VIDEO", () => {
  it("is the string 'video'", () => {
    expect(VIDEO).toBe("video");
  });
});

describe("videoMeta", () => {
  it("has a name and preloadOrder", () => {
    expect(videoMeta.name).toBe("Video");
    expect(videoMeta.preloadOrder).toBeDefined();
  });
});

describe("createVideoObject", () => {
  it("returns an object with definition type video", () => {
    const obj = createVideoObject();
    expect(obj.definition.type).toBe(VIDEO);
  });

  it("has video property in values", () => {
    const obj = createVideoObject();
    expect((obj.definition.values as any).video).toBeDefined();
  });

  it("has common and transform definitions", () => {
    const obj = createVideoObject();
    expect(obj.commonStyleDefinition).toBeDefined();
    expect(obj.transformDefinition).toBeDefined();
  });
});

describe("getVideoHtml", () => {
  it("returns placeholder when no sourceType in editor", () => {
    const obj = {
      id: "vid-2",
      definition: {
        values: {
          videoFit: { size: "fill", positionHorizontal: "center", positionVertical: "center" },
          video: { video: {}, filename: "", previewImage: {} },
        },
      },
    };
    const result = getVideoHtml({
      object: obj as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(result).toContain("placeholder");
  });

  it("returns video element in player mode", () => {
    const result = getVideoHtml({
      object: minimalVideoObject() as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
      isPlayer: true,
    });
    expect(result).toContain("<video");
    expect(result).toContain("video-content");
  });

  it("respects muted attribute in player", () => {
    const result = getVideoHtml({
      object: minimalVideoObject() as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
      isPlayer: true,
    });
    expect(result).toContain("muted");
  });
});
