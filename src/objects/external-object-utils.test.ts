import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../integration/utils/load-extension", () => ({
  addExtensionCode: vi.fn(),
}));

vi.mock("webslider-sdk/lib/animations/animations-register", () => ({
  isAnimationRegistered: vi.fn(() => false),
  registerExternalAnimation: vi.fn(),
}));

vi.mock("webslider-sdk/lib/objects/objects-register", () => ({
  isObjectRegistered: vi.fn(() => false),
  registerExternalObject: vi.fn(),
}));

vi.mock("webslider-sdk/lib/utils/logger/logger", () => ({
  logger: { object: { info: vi.fn() } },
}));

vi.mock("../globals", () => ({
  getGlobals: vi.fn(() => ({
    playerObjects: {},
    appObjects: {},
    playerAnimations: {},
    appAnimations: {},
  })),
}));

import { loadAndRegisterExternalComponent } from "./external-object-utils";
import { addExtensionCode } from "../integration/utils/load-extension";
import {
  isObjectRegistered,
  registerExternalObject,
} from "webslider-sdk/lib/objects/objects-register";
import {
  isAnimationRegistered,
  registerExternalAnimation,
} from "webslider-sdk/lib/animations/animations-register";

const baseExtension = {
  type: "my-obj",
  version: "1.0.0",
  name: "My Object",
  packageFiles: { playerObjectFilename: "player.js" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadAndRegisterExternalComponent", () => {
  it("skips loading if object type is already registered", async () => {
    vi.mocked(isObjectRegistered).mockReturnValue(true);
    await loadAndRegisterExternalComponent({
      ...baseExtension,
      extensionType: "object",
    } as any);
    expect(addExtensionCode).not.toHaveBeenCalled();
  });

  it("skips loading if animation type is already registered", async () => {
    vi.mocked(isAnimationRegistered).mockReturnValue(true);
    await loadAndRegisterExternalComponent({
      ...baseExtension,
      extensionType: "animation",
    } as any);
    expect(addExtensionCode).not.toHaveBeenCalled();
  });

  it("loads code and registers object when not yet registered", async () => {
    vi.mocked(isObjectRegistered).mockReturnValue(false);
    await loadAndRegisterExternalComponent({
      ...baseExtension,
      extensionType: "object",
    } as any);
    expect(addExtensionCode).toHaveBeenCalledWith("my-obj", "1.0.0");
    expect(registerExternalObject).toHaveBeenCalled();
  });

  it("loads code and registers animation when not yet registered", async () => {
    vi.mocked(isAnimationRegistered).mockReturnValue(false);
    await loadAndRegisterExternalComponent({
      ...baseExtension,
      extensionType: "animation",
    } as any);
    expect(addExtensionCode).toHaveBeenCalledWith("my-obj", "1.0.0");
    expect(registerExternalAnimation).toHaveBeenCalled();
  });

  it("does not throw for unsupported extension type", async () => {
    vi.mocked(isObjectRegistered).mockReturnValue(false);
    await expect(
      loadAndRegisterExternalComponent({
        ...baseExtension,
        extensionType: "unknown",
      } as any)
    ).resolves.not.toThrow();
  });
});
