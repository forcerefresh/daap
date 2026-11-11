import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RelativeRotationInputForm } from "./relative-rotation-input";

vi.mock("../input-utils", () => ({
  getCheckboxField: (_label: string, value: boolean, onChange: (v: boolean) => void) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
  ),
  getNumericFiled: (label: string) => (
    <div data-testid="numeric-field">{label || "numeric"}</div>
  ),
  getSelectField: (label: string) => (
    <div data-testid={`select-${label || "no-label"}`} />
  ),
}));

const disabledValue = {
  enabled: false,
  position: "rel",
  value: 90,
  direction: "_cw",
};

const enabledValue = {
  enabled: true,
  position: "rel",
  value: 90,
  direction: "_cw",
};

const baseProps = {
  displayName: "Rotation",
  propertyName: "rotation",
  inputType: "relative-rotation" as any,
  value: disabledValue as any,
  defaultValue: disabledValue as any,
  onChange: vi.fn(),
};

describe("RelativeRotationInputForm", () => {
  it("renders the displayName label", () => {
    render(<RelativeRotationInputForm {...baseProps} />);
    expect(screen.getByText("Rotation")).toBeInTheDocument();
  });

  it("shows only the checkbox when disabled", () => {
    render(<RelativeRotationInputForm {...baseProps} />);
    expect(screen.getByTestId("checkbox")).toBeInTheDocument();
    expect(screen.queryByTestId("numeric-field")).not.toBeInTheDocument();
  });

  it("shows checkbox, selects and numeric field when enabled", () => {
    render(<RelativeRotationInputForm {...baseProps} value={enabledValue as any} />);
    expect(screen.getByTestId("checkbox")).toBeInTheDocument();
    expect(screen.getByTestId("numeric-field")).toBeInTheDocument();
    expect(screen.getAllByTestId(/^select-/).length).toBeGreaterThan(0);
  });
});
