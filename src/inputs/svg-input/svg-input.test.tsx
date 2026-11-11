import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SVGInputForm } from "./svg-input";

vi.mock("../../panels/media-library/MediaLibraryPanel", () => ({
  default: () => <div data-testid="media-library" />,
  Panels: { MyVectors: "MyVectors", Vectors: "Vectors" },
}));
vi.mock("../../utils/hooks/on-click-outside", () => ({ default: () => {} }));

const baseValue = {
  source: "<svg><circle r='10'/></svg>",
  colors: [],
  colorsType: "unique",
  disableCustomColors: false,
};

const baseProps = {
  displayName: "Icon",
  propertyName: "icon",
  inputType: "svg" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onInput: vi.fn(),
};

describe("SVGInputForm", () => {
  it("renders the label", () => {
    render(<SVGInputForm {...baseProps} />);
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("renders the SVG source inline", () => {
    const { container } = render(<SVGInputForm {...baseProps} />);
    expect(container.querySelector("circle")).toBeInTheDocument();
  });

  it("shows Browse button", () => {
    render(<SVGInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: /browse/i })).toBeInTheDocument();
  });
});
