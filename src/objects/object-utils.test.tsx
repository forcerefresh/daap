import { describe, it, expect } from "vitest";
import { getObjectRotation, getObjectScale } from "./object-utils";

describe("getObjectRotation", () => {
  it("returns rotation when defined", () => {
    expect(getObjectRotation({ rotation: 45 } as any)).toBe(45);
  });

  it("returns 0 when rotation is undefined", () => {
    expect(getObjectRotation({} as any)).toBe(0);
  });

  it("returns 0 when rotation is null", () => {
    expect(getObjectRotation({ rotation: null } as any)).toBe(0);
  });
});

describe("getObjectScale", () => {
  it("returns scale when defined", () => {
    expect(getObjectScale({ scale: 2 } as any)).toBe(2);
  });

  it("returns 1 when scale is undefined", () => {
    expect(getObjectScale({} as any)).toBe(1);
  });

  it("returns 1 when scale is null", () => {
    expect(getObjectScale({ scale: null } as any)).toBe(1);
  });
});
