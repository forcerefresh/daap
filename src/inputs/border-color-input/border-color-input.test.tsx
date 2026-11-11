import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BorderColorInputForm } from "./border-color-input";

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
  getColorField: (label: string) => (
    <div data-testid={`color-${label || "no-label"}`}>{label}</div>
  ),
}));

const commonValue = {
  useCommonValue: true,
  borderColor: { r: 0, g: 0, b: 0, a: 1 },
  topBorderColor: { r: 0, g: 0, b: 0, a: 1 },
  rightBorderColor: { r: 0, g: 0, b: 0, a: 1 },
  bottomBorderColor: { r: 0, g: 0, b: 0, a: 1 },
  leftBorderColor: { r: 0, g: 0, b: 0, a: 1 },
};

const sidesValue = { ...commonValue, useCommonValue: false };

const baseProps = {
  displayName: "Border Color",
  propertyName: "borderColor",
  inputType: "border-color" as any,
  value: commonValue as any,
  defaultValue: commonValue as any,
  onChange: vi.fn(),
};

describe("BorderColorInputForm", () => {
  it("renders Common and Sides buttons", () => {
    render(<BorderColorInputForm {...baseProps} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
    expect(screen.getByText("Sides")).toBeInTheDocument();
  });

  it("renders single color field in common mode", () => {
    render(<BorderColorInputForm {...baseProps} />);
    expect(screen.getAllByTestId(/^color-/).length).toBe(1);
  });

  it("renders four color fields in sides mode", () => {
    render(<BorderColorInputForm {...baseProps} value={sidesValue as any} />);
    expect(screen.getAllByTestId(/^color-/).length).toBe(4);
  });

  it("calls onChange when switching to Sides", async () => {
    const onChange = vi.fn();
    render(<BorderColorInputForm {...baseProps} onChange={onChange} />);
    await userEvent.click(screen.getByText("Sides"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ useCommonValue: false })
    );
  });
});
