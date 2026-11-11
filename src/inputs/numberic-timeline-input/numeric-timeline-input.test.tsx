import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { NumericTimelineInputForm } from "./numeric-timeline-input";

vi.mock("../input-utils", () => ({
  getNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
  getCheckboxField: (
    label: string,
    value: boolean,
    onChange: (v: boolean) => void
  ) => (
    <label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  ),
}));

const baseValue = {
  value: 100,
  hasTimelineProperties: false,
  delay: 0,
  duration: 500,
};

const baseProps = {
  displayName: "Width",
  propertyName: "width",
  inputType: "numeric-timeline" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("NumericTimelineInputForm", () => {
  it("renders the value field with displayName as label", () => {
    render(<NumericTimelineInputForm {...baseProps} />);
    expect(screen.getByTestId("field-Width")).toBeInTheDocument();
  });

  it("renders the Set different timing checkbox", () => {
    render(<NumericTimelineInputForm {...baseProps} />);
    expect(screen.getByText("Set different timing")).toBeInTheDocument();
  });

  it("does not show Delay/Duration fields when hasTimelineProperties is false", () => {
    render(<NumericTimelineInputForm {...baseProps} />);
    expect(screen.queryByTestId("field-Delay")).not.toBeInTheDocument();
    expect(screen.queryByTestId("field-Duraton")).not.toBeInTheDocument();
  });

  it("shows Delay and Duration fields when hasTimelineProperties is true", () => {
    const activeValue = { ...baseValue, hasTimelineProperties: true };
    render(<NumericTimelineInputForm {...baseProps} value={activeValue as any} />);
    expect(screen.getByTestId("field-Delay")).toBeInTheDocument();
    expect(screen.getByTestId("field-Duraton")).toBeInTheDocument();
  });
});
