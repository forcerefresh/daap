import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextStartPositionInputForm } from "./text-start-position-input";

vi.mock("../input-utils", () => ({
  getSelectField: (label: string, value: string, options: any[], onChange: (v: string) => void) => (
    <select
      data-testid={`select-${label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
  getNumericFiled: (label: string) => (
    <div data-testid={`numeric-${label}`}>{label}</div>
  ),
  getTextArea: (label: string) => (
    <div data-testid={`textarea-${label}`}>{label}</div>
  ),
}));

const baseValue = {
  startFrom: "0",
  fromCharacter: 0,
  customOrder: "",
};

const baseProps = {
  displayName: "Start Position",
  propertyName: "startPosition",
  inputType: "text-start-position" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("TextStartPositionInputForm", () => {
  it("renders the Start from select", () => {
    render(<TextStartPositionInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Start from")).toBeInTheDocument();
  });

  it("does not show extra fields for default startFrom", () => {
    render(<TextStartPositionInputForm {...baseProps} />);
    expect(screen.queryByTestId("numeric-Char idx")).not.toBeInTheDocument();
    expect(screen.queryByTestId("textarea-Order")).not.toBeInTheDocument();
  });

  it("shows Char idx numeric field when startFrom is from-character", () => {
    const fromCharValue = { ...baseValue, startFrom: "from-character" };
    render(<TextStartPositionInputForm {...baseProps} value={fromCharValue as any} />);
    expect(screen.getByTestId("numeric-Char idx")).toBeInTheDocument();
  });

  it("shows Order textarea when startFrom is custom-order", () => {
    const customOrderValue = { ...baseValue, startFrom: "custom-order" };
    render(<TextStartPositionInputForm {...baseProps} value={customOrderValue as any} />);
    expect(screen.getByTestId("textarea-Order")).toBeInTheDocument();
  });
});
