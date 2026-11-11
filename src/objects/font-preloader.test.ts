import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("webfontloader", () => ({
  load: vi.fn(),
}));

vi.mock("../globals", () => ({
  getGlobals: vi.fn(() => ({
    getMyFonts: vi.fn(() => []),
  })),
}));

vi.mock("@platform/utils/media", () => ({
  getMediaBaseUrl: vi.fn((f: string) => `/media/${f}`),
}));

vi.mock("../utils/doom-utils/css-utils", () => ({
  addStyle: vi.fn(),
}));

import { FontPreloader } from "./font-preloader";
import { load } from "webfontloader";
import { getGlobals } from "../globals";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FontPreloader", () => {
  it("creates a FontPreloader instance", () => {
    const fp = new FontPreloader();
    expect(fp).toBeDefined();
    expect(typeof fp.subscribe).toBe("function");
  });

  it("returns a resolved promise immediately for a loaded font", async () => {
    const fp = new FontPreloader();
    (fp as any).states["Arial"] = "loaded";
    await expect(fp.subscribe("Arial")).resolves.toBeUndefined();
  });

  it("returns a pending promise for a new font (loading)", () => {
    const fp = new FontPreloader();
    const result = fp.subscribe("Roboto");
    expect(result).toBeInstanceOf(Promise);
    expect((fp as any).states["Roboto"]).toBe("loading");
  });

  it("does not call loadFont again for a font already in loading state", () => {
    const fp = new FontPreloader();
    (fp as any).states["Roboto"] = "loading";
    const loadFontSpy = vi.spyOn(fp as any, "loadFont");
    fp.subscribe("Roboto");
    expect(loadFontSpy).not.toHaveBeenCalled();
  });

  it("resolves all subscribers when onLoaded is called", async () => {
    const fp = new FontPreloader();
    const p1 = fp.subscribe("Open Sans");
    const p2 = fp.subscribe("Open Sans");
    (fp as any).onLoaded("Open Sans");
    await expect(p1).resolves.toBeUndefined();
    await expect(p2).resolves.toBeUndefined();
    expect((fp as any).states["Open Sans"]).toBe("loaded");
  });

  it("calls webfontloader load for custom (non-google) fonts", () => {
    vi.mocked(getGlobals).mockReturnValue({
      getMyFonts: vi.fn(() => [{ name: "Lato", mediaSizes: [] }]),
    } as any);
    const fp = new FontPreloader();
    (fp as any).loadFont("Lato");
    expect(load).toHaveBeenCalled();
  });
});
