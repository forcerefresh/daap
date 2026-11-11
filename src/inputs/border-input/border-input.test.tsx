import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BorderInputForm } from "./border-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (displayName: string) => displayName,
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
        <button
          key={o.value}
          data-active={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
  getColorField: (label: string) => (
    <div data-testid={`color-${label || "no-label"}`}>{label}</div>
  ),
  getSelectField: (label: string) => (
    <div data-testid={`select-${label || "no-label"}`}>{label}</div>
  ),
}));
vi.mock("../../objects/create-object-factory", () => ({
  getBorderOptions: () => [
    { label: "solid", value: "solid" },
    { label: "dashed", value: "dashed" },
  ],
}));
vi.mock("webslider-sdk/lib/objects/common-properties-player", () => ({
  isIBorderValue: (v: any) => !("top" in v),
}));

const commonValue = { width: "1px", color: { r: 0, g: 0, b: 0, a: 1 }, style: "solid" };
const sidesValue = {
  top: { width: "1px", color: { r: 0, g: 0, b: 0, a: 1 }, style: "solid" },
  right: { width: "1px", color: { r: 0, g: 0, b: 0, a: 1 }, style: "solid" },
  bottom: { width: "1px", color: { r: 0, g: 0, b: 0, a: 1 }, style: "solid" },
  left: { width: "1px", color: { r: 0, g: 0, b: 0, a: 1 }, style: "solid" },
};

const baseProps = {
  displayName: "Border",
  propertyName: "border",
  inputType: "border" as any,
  value: commonValue as any,
  defaultValue: commonValue as any,
  onChange: vi.fn(),
};

describe("BorderInputForm", () => {
  it("renders Common and Sides buttons", () => {
    render(<BorderInputForm {...baseProps} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
    expect(screen.getByText("Sides")).toBeInTheDocument();
  });

  it("renders width, color, style fields in common mode", () => {
    render(<BorderInputForm {...baseProps} />);
    expect(screen.getByTestId("field-no-label")).toBeInTheDocument();
    expect(screen.getByTestId("color-no-label")).toBeInTheDocument();
    expect(screen.getByTestId("select-no-label")).toBeInTheDocument();
  });

  it("renders T/R/B/L row labels in sides mode", () => {
    render(<BorderInputForm {...baseProps} value={sidesValue as any} />);
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("calls onChange when switching to Sides", async () => {
    const onChange = vi.fn();
    render(<BorderInputForm {...baseProps} onChange={onChange} />);
    await userEvent.click(screen.getByText("Sides"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ top: expect.any(Object) })
    );
  });
});
