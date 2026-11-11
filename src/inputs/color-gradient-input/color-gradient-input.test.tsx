import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ColorGradientInputForm } from "./color-gradient-input";

vi.mock("../input-utils", () => ({
  getButtonGroupField: (
    _label: string,
    value: string,
    onChange: (v: string) => void,
    _options: any
  ) => (
    <div>
      <button data-testid="solid-btn" onClick={() => onChange("solid")}>
        Solid
      </button>
      <button data-testid="gradient-btn" onClick={() => onChange("gradient")}>
        Gradient
      </button>
      <span data-testid="current-type">{value}</span>
    </div>
  ),
  getColorField: () => <div data-testid="color-field" />,
  getLinearGradientField: () => <div data-testid="gradient-field" />,
}));

const solidValue = { r: 100, g: 150, b: 200, a: 1 };
const gradientValue = {
  points: [
    { color: { r: 255, g: 0, b: 0, a: 1 }, stop: 0 },
    { color: { r: 0, g: 0, b: 255, a: 1 }, stop: 100 },
  ],
  angle: 45,
};

const baseProps = {
  displayName: "Background",
  propertyName: "background",
  inputType: "color-gradient" as any,
  value: solidValue as any,
  defaultValue: solidValue as any,
  onChange: vi.fn(),
};

describe("ColorGradientInputForm", () => {
  it("renders the label", () => {
    render(<ColorGradientInputForm {...baseProps} />);
    expect(screen.getByText("Background")).toBeInTheDocument();
  });

  it("shows solid color field when value is a solid color", () => {
    render(<ColorGradientInputForm {...baseProps} value={solidValue as any} />);
    expect(screen.getByTestId("color-field")).toBeInTheDocument();
    expect(screen.queryByTestId("gradient-field")).not.toBeInTheDocument();
  });

  it("shows gradient field when value is a gradient", () => {
    render(<ColorGradientInputForm {...baseProps} value={gradientValue as any} />);
    expect(screen.getByTestId("gradient-field")).toBeInTheDocument();
    expect(screen.queryByTestId("color-field")).not.toBeInTheDocument();
  });

  it("calls onChange with solid color when switching to solid", async () => {
    const onChange = vi.fn();
    render(
      <ColorGradientInputForm
        {...baseProps}
        value={gradientValue as any}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByTestId("solid-btn"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ r: expect.any(Number) })
    );
  });

  it("calls onChange with gradient when switching to gradient", async () => {
    const onChange = vi.fn();
    render(
      <ColorGradientInputForm
        {...baseProps}
        value={solidValue as any}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByTestId("gradient-btn"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ points: expect.any(Array), angle: expect.any(Number) })
    );
  });
});
