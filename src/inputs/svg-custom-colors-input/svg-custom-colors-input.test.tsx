import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SVGCustomColorsForm } from "./svg-custom-colors-input";

vi.mock("../input-utils", () => ({
  getButtonGroupField: (label: string) => (
    <div data-testid="button-group">{label}</div>
  ),
  getColorField: (label: string) => (
    <div data-testid="color-field">{label}</div>
  ),
}));

vi.mock("webslider-sdk/lib/utils/utils", () => ({
  convertRGBColor2RGBAString: (c: any) =>
    `rgba(${c.r},${c.g},${c.b},${c.a ?? 1})`,
}));

vi.mock("../../utils/hooks/on-click-outside", () => ({
  default: () => {},
}));

const baseProps = {
  displayName: "SVG Colors",
  propertyName: "svg",
  inputType: "svg" as any,
  value: {
    source: "#ff0000",
    colors: [{ r: 255, g: 0, b: 0, a: 1 }],
    colorsType: "unique",
  } as any,
  defaultValue: { source: "" } as any,
  onChange: vi.fn(),
};

describe("SVGCustomColorsForm", () => {
  it("renders 'no colors' message when colors array is empty", () => {
    render(
      <SVGCustomColorsForm
        {...baseProps}
        value={{ ...baseProps.value, colors: [] }}
      />
    );
    expect(
      screen.getByText(/SVG does not contain colors/)
    ).toBeInTheDocument();
  });

  it("renders button group and color field when colors exist", () => {
    render(<SVGCustomColorsForm {...baseProps} />);
    expect(screen.getByTestId("button-group")).toBeInTheDocument();
    expect(screen.getByTestId("color-field")).toBeInTheDocument();
  });

  it("renders a color field for each color in 'all' mode", () => {
    render(
      <SVGCustomColorsForm
        {...baseProps}
        value={{
          ...baseProps.value,
          colors: [
            { r: 255, g: 0, b: 0, a: 1 },
            { r: 0, g: 255, b: 0, a: 1 },
          ],
          colorsType: "all",
        }}
      />
    );
    expect(screen.getAllByTestId("color-field")).toHaveLength(2);
  });

  it("renders 'too many colors' message when source has more than 50 colors", () => {
    const manyColorsSource = Array.from({ length: 51 }, (_, i) =>
      `#${i.toString(16).padStart(6, "0")}`
    ).join(" ");
    render(
      <SVGCustomColorsForm
        {...baseProps}
        value={{
          ...baseProps.value,
          source: manyColorsSource,
          colors: [{ r: 0, g: 0, b: 0, a: 1 }],
        }}
      />
    );
    expect(
      screen.getByText(/Colors editing is not allowed/)
    ).toBeInTheDocument();
  });

  it("calls onChange to initialize colors when value.colors is not set", () => {
    const onChange = vi.fn();
    render(
      <SVGCustomColorsForm
        {...baseProps}
        value={{ source: "#ff0000" } as any}
        onChange={onChange}
      />
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ colors: expect.any(Array) })
    );
  });
});
