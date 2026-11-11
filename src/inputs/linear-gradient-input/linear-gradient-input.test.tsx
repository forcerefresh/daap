import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LinearGradientInputForm } from "./linear-gradient-input";

vi.mock("../input-utils", () => ({
  getColorField: () => <div data-testid="color-field" />,
  getSelectSlider: () => <div data-testid="angle-slider" />,
}));

const baseValue = {
  points: [
    { color: { r: 255, g: 0, b: 0, a: 1 }, stop: 0 },
    { color: { r: 0, g: 0, b: 255, a: 1 }, stop: 100 },
  ],
  angle: 90,
};

const baseProps = {
  displayName: "Gradient",
  propertyName: "gradient",
  inputType: "linear-gradient" as any,
  value: baseValue,
  defaultValue: baseValue,
  onChange: vi.fn(),
};

describe("LinearGradientInputForm", () => {
  it("renders a color field for each gradient point", () => {
    render(<LinearGradientInputForm {...baseProps} />);
    const colorFields = screen.getAllByTestId("color-field");
    expect(colorFields).toHaveLength(2);
  });

  it("renders the angle slider", () => {
    render(<LinearGradientInputForm {...baseProps} />);
    expect(screen.getByTestId("angle-slider")).toBeInTheDocument();
  });

  it("renders the Angle label", () => {
    render(<LinearGradientInputForm {...baseProps} />);
    expect(screen.getByText("Angle")).toBeInTheDocument();
  });
});
