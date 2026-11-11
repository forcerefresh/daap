import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLayerWrapper = {
  style: { width: "", height: "", left: "", top: "" },
};
const mockLayer = {
  style: { width: "", height: "" },
};

vi.mock("../../utils/animation-utils", () => ({
  getLayerElementById: vi.fn(() => mockLayer),
  getLayerWrapperElementById: vi.fn(() => mockLayerWrapper),
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
}));

import { layerSizeUpdate } from "./layer";

describe("layerSizeUpdate", () => {
  beforeEach(() => {
    mockLayerWrapper.style = { width: "", height: "", left: "", top: "" };
    mockLayer.style = { width: "", height: "" };
  });

  it("sets left and top on wrapper", async () => {
    await layerSizeUpdate({
      id: "layer-1",
      className: "layer-1",
      calculatedObjectSize: { left: "50px", top: "100px", width: "300px", height: "200px" },
      skipSizeUpdate: false,
    } as any);
    expect(mockLayerWrapper.style.left).toBe("50px");
    expect(mockLayerWrapper.style.top).toBe("100px");
  });

  it("sets width and height when skipSizeUpdate is false", async () => {
    await layerSizeUpdate({
      id: "layer-1",
      className: "layer-1",
      calculatedObjectSize: { left: "0px", top: "0px", width: "400px", height: "300px" },
      skipSizeUpdate: false,
    } as any);
    expect(mockLayerWrapper.style.width).toBe("400px");
    expect(mockLayerWrapper.style.height).toBe("300px");
    expect(mockLayer.style.width).toBe("400px");
    expect(mockLayer.style.height).toBe("300px");
  });

  it("skips width/height when skipSizeUpdate is true", async () => {
    await layerSizeUpdate({
      id: "layer-1",
      className: "layer-1",
      calculatedObjectSize: { left: "10px", top: "20px", width: "400px", height: "300px" },
      skipSizeUpdate: true,
    } as any);
    expect(mockLayerWrapper.style.width).toBe("");
    expect(mockLayerWrapper.style.height).toBe("");
  });
});
