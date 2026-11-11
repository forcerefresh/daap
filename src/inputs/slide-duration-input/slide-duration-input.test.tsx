import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { InheritableTimeInputForm } from "./slide-duration-input";

vi.mock("../input-utils", () => ({
  getSelectField: (_label: string, value: string, _options: any, onChange: (v: string) => void) => (
    <select data-testid="inherit-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="inherit">Inherit</option>
      <option value="custom">Custom</option>
    </select>
  ),
  getUnitNumericFiled: () => <input data-testid="custom-value" />,
}));

const options = [
  { value: "inherit", label: "Inherit" },
  { value: "custom", label: "Custom" },
];

const baseProps = {
  displayName: "Duration",
  propertyName: "duration",
  inputType: "inherit-time" as any,
  defaultValue: { inheritFrom: "inherit", customValue: "1s" },
  value: { inheritFrom: "inherit" as const, customValue: "1s" },
  options,
  parentTime: null,
  onChange: vi.fn(),
};

describe("InheritableTimeInputForm", () => {
  it("renders the label", () => {
    render(<InheritableTimeInputForm {...baseProps} />);
    expect(screen.getByText("Duration")).toBeInTheDocument();
  });

  it("renders the inherit/custom selector", () => {
    render(<InheritableTimeInputForm {...baseProps} />);
    expect(screen.getByTestId("inherit-select")).toBeInTheDocument();
  });

  it("shows custom value input when inheritFrom is custom", () => {
    render(
      <InheritableTimeInputForm
        {...baseProps}
        value={{ inheritFrom: "custom", customValue: "2s" }}
      />
    );
    expect(screen.getByTestId("custom-value")).toBeInTheDocument();
  });

  it("hides custom value input when inheritFrom is inherit and parentTime is null", () => {
    render(<InheritableTimeInputForm {...baseProps} />);
    expect(screen.queryByTestId("custom-value")).not.toBeInTheDocument();
  });

  it("calls onChange when select value changes", async () => {
    const onChange = vi.fn();
    render(<InheritableTimeInputForm {...baseProps} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByTestId("inherit-select"), "custom");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ inheritFrom: "custom" })
    );
  });
});
