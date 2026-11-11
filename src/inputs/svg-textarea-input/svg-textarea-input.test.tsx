import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SVGTextAreaInputForm } from "./svg-textarea-input";

vi.mock("../../panels/media-library/MediaLibraryPanel", () => ({
  default: () => <div data-testid="media-library" />,
  Panels: { MyVectors: "MyVectors", Vectors: "Vectors" },
}));
vi.mock("../../utils/hooks/on-click-outside", () => ({
  default: () => {},
}));
vi.mock("lodash-es", async () => {
  const actual = await vi.importActual("lodash-es");
  const debounceFn = (fn: any) => {
    const d = (...args: any[]) => fn(...args);
    d.flush = () => {};
    d.cancel = () => {};
    return d;
  };
  return { ...(actual as any), debounce: debounceFn };
});

const baseProps = {
  displayName: "SVG Source",
  propertyName: "svgSource",
  inputType: "svg-textarea" as any,
  value: { source: "<svg></svg>" } as any,
  defaultValue: { source: "" } as any,
  onInput: vi.fn(),
};

describe("SVGTextAreaInputForm", () => {
  it("renders the displayName label", () => {
    render(<SVGTextAreaInputForm {...baseProps} />);
    expect(screen.getByText("SVG Source")).toBeInTheDocument();
  });

  it("renders the textarea with current source value", () => {
    render(<SVGTextAreaInputForm {...baseProps} />);
    expect(screen.getByDisplayValue("<svg></svg>")).toBeInTheDocument();
  });

  it("renders the Browse button", () => {
    render(<SVGTextAreaInputForm {...baseProps} />);
    expect(screen.getByText("Browse")).toBeInTheDocument();
  });

  it("calls onInput when textarea changes", () => {
    const onInput = vi.fn();
    render(<SVGTextAreaInputForm {...baseProps} onInput={onInput} />);
    fireEvent.change(screen.getByDisplayValue("<svg></svg>"), {
      target: { value: "<svg><rect/></svg>" },
    });
    expect(onInput).toHaveBeenCalledWith("<svg><rect/></svg>");
  });
});
