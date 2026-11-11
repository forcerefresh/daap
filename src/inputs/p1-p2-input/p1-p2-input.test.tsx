import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { P1P2InputForm } from "./p1-p2-input";

vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (
    label: string,
    value: string,
    onChange: (v: string) => void
  ) => (
    <input
      data-testid={`field-${label}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const baseValue = { x1: "0px", y1: "0px", x2: "100px", y2: "100px" };

const baseProps = {
  displayName: "P1/P2",
  propertyName: "p1p2",
  inputType: "p1-p2" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("P1P2InputForm", () => {
  it("renders X1, Y1, X2, Y2 fields", () => {
    render(<P1P2InputForm {...baseProps} />);
    expect(screen.getByTestId("field-X1")).toBeInTheDocument();
    expect(screen.getByTestId("field-Y1")).toBeInTheDocument();
    expect(screen.getByTestId("field-X2")).toBeInTheDocument();
    expect(screen.getByTestId("field-Y2")).toBeInTheDocument();
  });

  it("displays current values in fields", () => {
    render(<P1P2InputForm {...baseProps} />);
    expect(screen.getAllByDisplayValue("0px")).toHaveLength(2);
    expect(screen.getAllByDisplayValue("100px")).toHaveLength(2);
  });

  it("calls onChange when X1 changes", () => {
    const onChange = vi.fn();
    render(<P1P2InputForm {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("field-X1"), {
      target: { value: "50px" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ x1: "50px" })
    );
  });
});
