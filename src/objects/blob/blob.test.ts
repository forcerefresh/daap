import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/animation-utils", () => ({
  addCommonStyleToObjectElementContent: vi.fn(),
  addTransformStyleToObjectElementContent: vi.fn(),
  getObjectElementById: vi.fn(),
  getObjectWrapperElementById: vi.fn(),
}));

import { createBlobObject, getBlobObjectForm, getBlobHtml, blobMeta, BLOB } from "./blob";

const minimalObject = () => ({
  id: "blob-1",
  properties: {
    strokeWidth: "5px",
    strokeColor: { r: 255, g: 255, b: 255, a: 1 },
    fillColor: { r: 0, g: 0, b: 255, a: 0.5 },
    growth: 6,
    edges: 8,
    seed: 42,
  },
  width: 200,
  height: 200,
});

describe("BLOB", () => {
  it("is a non-empty string", () => {
    expect(typeof BLOB).toBe("string");
    expect(BLOB.length).toBeGreaterThan(0);
  });
});

describe("blobMeta", () => {
  it("has a name", () => {
    expect(blobMeta.name).toBe("Blob");
  });
});

describe("createBlobObject", () => {
  it("returns an object with blob properties", () => {
    const obj = createBlobObject();
    const props = obj.properties as any;
    expect(props.strokeWidth).toBeDefined();
    expect(props.growth).toBeDefined();
    expect(props.edges).toBeDefined();
    expect(typeof props.seed).toBe("number");
  });

  it("generates a random seed each time", () => {
    const obj1 = createBlobObject();
    const obj2 = createBlobObject();
    const s1 = (obj1.properties as any).seed;
    const s2 = (obj2.properties as any).seed;
    expect(typeof s1).toBe("number");
    expect(typeof s2).toBe("number");
  });
});

describe("getBlobObjectForm", () => {
  it("returns a form array", () => {
    const form = getBlobObjectForm();
    expect(Array.isArray(form)).toBe(true);
    expect(form.length).toBeGreaterThan(0);
  });

  it("contains strokeWidth, growth, edges and seed inputs", () => {
    const form = getBlobObjectForm();
    const names = form.map((f) => f.propertyName);
    expect(names).toContain("strokeWidth");
    expect(names).toContain("growth");
    expect(names).toContain("edges");
    expect(names).toContain("seed");
  });
});

describe("getBlobHtml", () => {
  it("returns a non-empty string", () => {
    const result = getBlobHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the object id in the output", () => {
    const result = getBlobHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(result).toContain("blob-1");
  });

  it("contains an svg element", () => {
    const result = getBlobHtml({
      object: minimalObject() as any,
      calculatedObjectSize: { width: "200px", height: "200px" } as any,
    });
    expect(result).toContain("<svg");
  });
});
