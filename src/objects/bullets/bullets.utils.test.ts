import { describe, it, expect } from "vitest";
import { getImageThumbnailHtml } from "./bullets.utils";

describe("getImageThumbnailHtml", () => {
  it("returns a string for a valid src", () => {
    const result = getImageThumbnailHtml("http://img.jpg");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains the provided src", () => {
    const result = getImageThumbnailHtml("http://example.com/thumb.jpg");
    expect(result).toContain("http://example.com/thumb.jpg");
  });

  it("handles undefined src without crashing", () => {
    expect(() => getImageThumbnailHtml(undefined)).not.toThrow();
  });
});
