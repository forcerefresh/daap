import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UnitsNumberInputForm } from "./units-number-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));
vi.mock("@blueprintjs/popover2", () => ({
  Tooltip2: ({ children }: any) => <>{children}</>,
}));

const baseProps = {
  displayName: "Font Size",
  propertyName: "fontSize",
  inputType: "units-number" as any,
  value: "16px",
  defaultValue: "16px",
  allowedUnits: ["px", "em", "%"] as any,
  onChange: vi.fn(),
};

describe("UnitsNumberInputForm", () => {
  it("renders the label", () => {
    render(<UnitsNumberInputForm {...baseProps} />);
    expect(screen.getByText("Font Size")).toBeInTheDocument();
  });

  it("shows the numeric portion of the value in the input", () => {
    render(<UnitsNumberInputForm {...baseProps} />);
    expect(screen.getByDisplayValue("16")).toBeInTheDocument();
  });

  it("shows the unit tag", () => {
    render(<UnitsNumberInputForm {...baseProps} />);
    expect(screen.getByText("px")).toBeInTheDocument();
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(<UnitsNumberInputForm {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("16"), {
      target: { value: "20" },
    });
    expect(onChange).toHaveBeenCalledWith("20px");
  });
});
