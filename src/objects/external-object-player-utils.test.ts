import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("webslider-sdk/lib/animations/animations-register", () => ({
  registerExternalAnimation: vi.fn(),
}));

vi.mock("webslider-sdk/lib/objects/objects-register", () => ({
  registerExternalObject: vi.fn(),
}));

vi.mock("webslider-sdk/lib/utils/logger/logger", () => ({
  logger: { object: { info: vi.fn() } },
}));

vi.mock("../globals", () => ({
  getGlobals: vi.fn(() => ({
    playerObjects: { "my-ext": { type: "my-ext" } },
    playerAnimations: { "my-anim": { animationId: "my-anim" } },
  })),
}));

import { loadAndRegisterExternalComponentForPlayer } from "./external-object-player-utils";
import {
  registerExternalObject,
} from "webslider-sdk/lib/objects/objects-register";
import {
  registerExternalAnimation,
} from "webslider-sdk/lib/animations/animations-register";

const baseExtension = {
  type: "my-ext",
  version: "1.0.0",
  name: "My Ext",
  packageFiles: { playerObjectFilename: "player.js" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadAndRegisterExternalComponentForPlayer", () => {
  it("calls registerExternalObject for object extension type", async () => {
    await loadAndRegisterExternalComponentForPlayer({
      ...baseExtension,
      extensionType: "object",
    } as any);
    expect(registerExternalObject).toHaveBeenCalled();
  });

  it("calls registerExternalAnimation for animation extension type", async () => {
    await loadAndRegisterExternalComponentForPlayer({
      ...baseExtension,
      type: "my-anim",
      extensionType: "animation",
      packageFiles: { playerAnimationFilename: "anim.js" },
    } as any);
    expect(registerExternalAnimation).toHaveBeenCalled();
  });

  it("does not throw for unsupported extension type", async () => {
    await expect(
      loadAndRegisterExternalComponentForPlayer({
        ...baseExtension,
        extensionType: "unknown",
      } as any)
    ).resolves.not.toThrow();
  });

  it("uses absolute URL directly when filename starts with https", async () => {
    const ext = {
      ...baseExtension,
      extensionType: "object",
      packageFiles: { playerObjectFilename: "https://cdn.example.com/ext.js" },
    };
    await expect(
      loadAndRegisterExternalComponentForPlayer(ext as any)
    ).resolves.not.toThrow();
  });
});
