import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ImageInputForm } from "./image-input";

vi.mock("../../panels/media-library/MediaLibraryPanel", () => ({
  default: ({ onRequestClose }: any) => (
    <div data-testid="media-library">
      <button onClick={onRequestClose}>Close</button>
    </div>
  ),
  Panels: { MyImages: "MyImages", Images: "Images", MyVectors: "MyVectors", Vectors: "Vectors" },
}));
vi.mock("../../utils/hooks/on-click-outside", () => ({ default: () => {} }));
vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: (v: any) => v?.url ?? null,
}));
vi.mock("../input-utils", () => ({
  getSelectField: (_label: string, value: string, _options: any, _onChange: any) => (
    <div data-testid="size-select">{value}</div>
  ),
}));

const baseValue = {
  sourceType: "local",
  mediaSizes: [{ sizeType: "original", sourceFilename: "photo.jpg", width: 800, height: 600 }],
  format: "jpg",
  sizeType: "original",
};

const baseProps = {
  displayName: "Background Image",
  propertyName: "image",
  inputType: "image" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("ImageInputForm", () => {
  it("renders the label", () => {
    render(<ImageInputForm {...baseProps} />);
    expect(screen.getByText("Background Image")).toBeInTheDocument();
  });

  it("shows Browse images button", () => {
    render(<ImageInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: /browse images/i })).toBeInTheDocument();
  });

  it("opens media library panel on browse click", async () => {
    render(<ImageInputForm {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /browse images/i }));
    expect(screen.getByTestId("media-library")).toBeInTheDocument();
  });

  it("shows size selector when mediaSizes exist and format is not svg", () => {
    render(<ImageInputForm {...baseProps} />);
    expect(screen.getByTestId("size-select")).toBeInTheDocument();
  });

  it("hides size selector for svg format", () => {
    render(<ImageInputForm {...baseProps} value={{ ...baseValue, format: "svg" } as any} />);
    expect(screen.queryByTestId("size-select")).not.toBeInTheDocument();
  });
});
