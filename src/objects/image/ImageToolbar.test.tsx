import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("../../inputs/input-utils", () => ({
  getCoverLayoutField: vi.fn(() => <div data-testid="cover-layout-field" />),
}));

vi.mock("./ImageToolbar.module.scss", () => ({
  default: { inputsHolder: "inputsHolder" },
}));

import { ImageToolbar } from "./ImageToolbar";

const mockProps = {
  mode: "editor" as any,
  object: {
    id: "obj-1",
    properties: {
      fit: { size: "cover", positionHorizontal: "center", positionVertical: "center" },
      image: { sourceType: "url", url: "http://x.jpg" },
    },
  } as any,
  updateObject: vi.fn(),
  deleteObject: vi.fn(),
};

describe("ImageToolbar", () => {
  it("renders without crashing", () => {
    const { container } = render(<ImageToolbar {...mockProps} />);
    expect(container).toBeTruthy();
  });

  it("renders the cover layout field when object is provided", () => {
    render(<ImageToolbar {...mockProps} />);
    expect(screen.getByTestId("cover-layout-field")).toBeTruthy();
  });

  it("renders nothing when object is undefined", () => {
    const { container } = render(
      <ImageToolbar {...{ ...mockProps, object: undefined }} />,
    );
    expect(container.querySelector(".inputsHolder")).toBeNull();
  });
});
