import { describe, it, expect, vi } from "vitest";

vi.mock("webslider-sdk/lib/utils/logger/logger", () => ({
  logger: {
    player: { debug: vi.fn() },
  },
}));

vi.mock("webslider-sdk/lib/connectors/connector-manager", () => ({
  getConnectorBySourceId: vi.fn(() => null),
}));

import {
  execCodeAnimation,
  execCodeAppDef,
  execCodePlayerDef,
  EXEC_CODE_ANIMATION,
} from "./exec-code-animation";

describe("EXEC_CODE_ANIMATION", () => {
  it("is the string 'exec-code'", () => {
    expect(EXEC_CODE_ANIMATION).toBe("exec-code");
  });
});

describe("execCodeAnimation", () => {
  it("returns an object with the expected lifecycle methods", () => {
    const anim = execCodeAnimation();
    expect(typeof anim.init).toBe("function");
    expect(typeof anim.start).toBe("function");
    expect(typeof anim.stop).toBe("function");
    expect(typeof anim.update).toBe("function");
    expect(typeof anim.destroy).toBe("function");
    expect(typeof anim.pause).toBe("function");
    expect(typeof anim.resume).toBe("function");
  });

  it("calls onStart with expected shape when start is invoked", () => {
    const anim = execCodeAnimation();
    const onStart = vi.fn();
    const config = {
      id: "obj1",
      className: "cls",
      values: { x: 1 },
      calculatedObjectSize: { width: 100, height: 50 } as any,
      onStart,
    };
    anim.start(config);
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ id: "obj1", className: "cls", values: { x: 1 } })
    );
  });

  it("calls onStop with expected shape when stop is invoked", () => {
    const anim = execCodeAnimation();
    const onStop = vi.fn();
    const config = {
      id: "obj2",
      className: "cls2",
      values: {},
      calculatedObjectSize: {} as any,
      onStop,
    };
    anim.stop(config);
    expect(onStop).toHaveBeenCalledWith(
      expect.objectContaining({ id: "obj2" })
    );
  });

  it("calls onTimeUpdate with expected shape when update is invoked", () => {
    const anim = execCodeAnimation();
    const onTimeUpdate = vi.fn();
    const config = {
      id: "obj3",
      className: "cls3",
      values: {},
      calculatedObjectSize: {} as any,
      duration: 5000,
      onTimeUpdate,
    };
    anim.update(config, 1500);
    expect(onTimeUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "obj3", currentTime: 1500, duration: 5000 })
    );
  });

  it("calls onStop in destroy (same as stop)", () => {
    const anim = execCodeAnimation();
    const onStop = vi.fn();
    anim.destroy({ id: "d", className: "c", values: {}, calculatedObjectSize: {} as any, onStop });
    expect(onStop).toHaveBeenCalled();
  });
});

describe("execCodeAppDef", () => {
  it("references the exec-code animation id", () => {
    expect(execCodeAppDef.animationId).toBe(EXEC_CODE_ANIMATION);
  });
});

describe("execCodePlayerDef", () => {
  it("references the exec-code animation id and factory function", () => {
    expect(execCodePlayerDef.animationId).toBe(EXEC_CODE_ANIMATION);
    expect(execCodePlayerDef.animationFunc).toBe(execCodeAnimation);
  });
});
