import { describe, it, expect } from "vitest";
import { blobGenerator, _shuffle } from "./blob-utils";

describe("blobGenerator", () => {
  it("returns a path string and seedValue", () => {
    const result = blobGenerator({ size: 200, growth: 6, edges: 6, seed: 42 });
    expect(typeof result.path).toBe("string");
    expect(result.path.startsWith("M")).toBe(true);
    expect(typeof result.seedValue).toBe("number");
  });

  it("produces the same path for the same seed", () => {
    const r1 = blobGenerator({ size: 200, growth: 6, edges: 6, seed: 12345 });
    const r2 = blobGenerator({ size: 200, growth: 6, edges: 6, seed: 12345 });
    expect(r1.path).toBe(r2.path);
    expect(r1.seedValue).toBe(r2.seedValue);
  });

  it("generates a valid svg path (contains Q bezier curves)", () => {
    const { path } = blobGenerator({ size: 400, growth: 8, edges: 8, seed: 99 });
    expect(path).toContain("Q");
    expect(path.endsWith("Z")).toBe(true);
  });

  it("uses provided seed value as seedValue", () => {
    const { seedValue } = blobGenerator({ size: 200, growth: 6, edges: 6, seed: 777 });
    expect(seedValue).toBe(777);
  });

  it("returns a path with more curve points for more edges", () => {
    const few = blobGenerator({ size: 200, growth: 6, edges: 4, seed: 1 });
    const many = blobGenerator({ size: 200, growth: 6, edges: 10, seed: 1 });
    expect(many.path.length).toBeGreaterThan(few.path.length);
  });
});

describe("_shuffle", () => {
  it("returns an array of the same length", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = _shuffle([...arr]);
    expect(result).toHaveLength(5);
  });

  it("contains the same elements after shuffling", () => {
    const arr = [10, 20, 30, 40];
    const result = _shuffle([...arr]);
    expect(result.sort()).toEqual([10, 20, 30, 40].sort());
  });
});
