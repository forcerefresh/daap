import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SvgMaskInputForm } from "./svg-mask-input";

vi.mock("../../panels/media-library/MediaLibraryPanel", () => ({
  default: () => <div data-testid="media-library" />,
  Panels: { MySvgMask: "MySvgMask", SvgMask: "SvgMask" },
}));
vi.mock("../../utils/hooks/on-click-outside", () => ({ default: () => {} }));
vi.mock("../../utils/components/inline-svg-preview/InlineSvgPreview", () => ({
  renderInlineSvgPreview: () => <div data-testid="svg-preview" />,
}));

const baseProps = {
  displayName: "SVG Mask",
  propertyName: "svgMask",
  inputType: "svg-mask" as any,
  value: { inlineSvgPreview: "<svg/>" } as any,
  defaultValue: {} as any,
  onChange: vi.fn(),
};

describe("SvgMaskInputForm", () => {
  it("renders the label", () => {
    render(<SvgMaskInputForm {...baseProps} />);
    expect(screen.getByText("SVG Mask")).toBeInTheDocument();
  });

  it("renders the SVG preview when inlineSvgPreview is set", () => {
    render(<SvgMaskInputForm {...baseProps} />);
    expect(screen.getByTestId("svg-preview")).toBeInTheDocument();
  });

  it("shows Browse SVG masks button", () => {
    render(<SvgMaskInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: /browse svg masks/i })).toBeInTheDocument();
  });

  it("opens the media library on browse click", async () => {
    render(<SvgMaskInputForm {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /browse svg masks/i }));
    expect(screen.getByTestId("media-library")).toBeInTheDocument();
  });
});
