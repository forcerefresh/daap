import { describe, it, expect } from "vitest";
import {
  createLineObject,
  getLineForm,
  getLineHtml,
  lineMeta,
  linePostProcess,
  getBounds,
  LINE,
} from "./line";

const minimalObject = () => ({
  id: "line-1",
  properties: {
    strokeWidth: 2,
    strokeColor: { r: 255, g: 255, b: 255, a: 1 },
    strokeLineCap: "miter",
    strokeDashArray: "",
  },
  x1: 10,
  y1: 20,
  x2: 110,
  y2: 120,
});

describe("LINE", () => {
  it("is a non-empty string", () => {
    expect(typeof LINE).toBe("string");
    expect(LINE.length).toBeGreaterThan(0);
  });
});

describe("lineMeta", () => {
  it("has a name and sizeType", () => {
    expect(lineMeta.name).toBe("Line");
    expect(lineMeta.sizeType).toBe("line");
  });
});

describe("createLineObject", () => {
  it("returns an object with expected default properties", () => {
    const obj = createLineObject();
    const props = obj.properties as any;
    expect(props.strokeWidth).toBe(1);
    expect(props.strokeLineCap).toBe("miter");
  });

  it("uses provided initial values", () => {
    const obj = createLineObject({ strokeWidth: 5, strokeDashArray: "5,2" });
    const props = obj.properties as any;
    expect(props.strokeWidth).toBe(5);
    expect(props.strokeDashArray).toBe("5,2");
  });
});

describe("getLineForm", () => {
  it("returns a form array with expected length", () => {
    const form = getLineForm();
    expect(form.length).toBeGreaterThanOrEqual(3);
  });

  it("contains strokeWidth, strokeColor and strokeLineCap inputs", () => {
    const form = getLineForm();
    const names = form.map((f) => f.propertyName);
    expect(names).toContain("strokeWidth");
    expect(names).toContain("strokeColor");
    expect(names).toContain("strokeLineCap");
  });
});

describe("getBounds", () => {
  it("computes correct bounds from x1/y1/x2/y2", () => {
    const bounds = getBounds(minimalObject() as any);
    expect(bounds.x).toBe(10);
    expect(bounds.y).toBe(20);
    expect(bounds.width).toBe(100);
    expect(bounds.height).toBe(100);
  });
});

describe("getLineHtml", () => {
  it("returns a non-empty string", () => {
    const result = getLineHtml({
      object: minimalObject() as any,
      calculatedObjectSize: {} as any,
    });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the object id", () => {
    const result = getLineHtml({
      object: minimalObject() as any,
      calculatedObjectSize: {} as any,
    });
    expect(result).toContain("line-1");
  });

  it("contains an svg path", () => {
    const result = getLineHtml({
      object: minimalObject() as any,
      calculatedObjectSize: {} as any,
    });
    expect(result).toContain("<path");
  });
});

describe("linePostProcess", () => {
  it("returns a clone of the object", () => {
    const obj = minimalObject() as any;
    const result = linePostProcess({ object: obj, prevObject: obj } as any);
    expect(result).not.toBe(obj);
    expect(result.id).toBe("line-1");
  });
});
