import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MultiImageInputForm } from "./multi-image-input";

vi.mock("../../panels/media-library/MediaLibraryPanel", () => ({
  default: () => <div data-testid="media-library" />,
  Panels: { MyImages: "MyImages", Images: "Images" },
  SelectionType: { Multiple: "multiple" },
}));
vi.mock("../../utils/hooks/on-click-outside", () => ({ default: () => {} }));
vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: () => null,
}));
vi.mock("../input-utils", () => ({
  getImageField: () => <div data-testid="image-field" />,
}));

const baseValue = [
  { image: { sourceType: "local", filename: "a.jpg" } },
  { image: { sourceType: "local", filename: "b.jpg" } },
];

const baseProps = {
  displayName: "Slideshow",
  propertyName: "images",
  inputType: "multi-image" as any,
  value: baseValue as any,
  defaultValue: [] as any,
  onChange: vi.fn(),
};

describe("MultiImageInputForm", () => {
  it("renders the label", () => {
    render(<MultiImageInputForm {...baseProps} />);
    expect(screen.getByText("Slideshow")).toBeInTheDocument();
  });

  it("renders an image row for each item", () => {
    render(<MultiImageInputForm {...baseProps} />);
    expect(screen.getAllByTestId("image-field")).toHaveLength(2);
  });

  it("shows Select Local Images and Select Library Images buttons", () => {
    render(<MultiImageInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: /select local images/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select library images/i })).toBeInTheDocument();
  });

  it("shows Add Url Image button", () => {
    render(<MultiImageInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: /add url image/i })).toBeInTheDocument();
  });
});
