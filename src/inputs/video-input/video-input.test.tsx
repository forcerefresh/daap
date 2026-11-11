import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VideoInputForm } from "./video-input";

vi.mock("../../panels/media-library/MediaLibraryPanel", () => ({
  default: () => <div data-testid="media-library" />,
  Panels: { MyVideos: "MyVideos" },
}));
vi.mock("../../utils/hooks/on-click-outside", () => ({ default: () => {} }));
vi.mock("../../integration/utils/local-media", () => ({
  getMediaSrc: () => null,
}));
vi.mock("../input-utils", () => ({
  getButtonGroupField: (
    _label: string,
    value: string,
    onChange: (v: string) => void,
    options: { value: string; label: string }[]
  ) => (
    <div>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  ),
  getTextArea: () => <textarea data-testid="url-input" />,
}));

const baseValue = {
  video: { sourceType: "local", url: "", filename: "" },
  previewImage: null,
  filename: "",
};

const baseProps = {
  displayName: "Video",
  propertyName: "video",
  inputType: "video" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("VideoInputForm", () => {
  it("renders the label", () => {
    render(<VideoInputForm {...baseProps} />);
    expect(screen.getByText("Video")).toBeInTheDocument();
  });

  it("shows source type toggle buttons", () => {
    render(<VideoInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: /local/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /url/i })).toBeInTheDocument();
  });

  it("shows Browse button when sourceType is local", () => {
    render(<VideoInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: /browse/i })).toBeInTheDocument();
  });

  it("shows URL textarea when sourceType is url", () => {
    const urlValue = { ...baseValue, video: { ...baseValue.video, sourceType: "url" } };
    render(<VideoInputForm {...baseProps} value={urlValue as any} />);
    expect(screen.getByTestId("url-input")).toBeInTheDocument();
  });
});
