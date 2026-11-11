import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BoxInputForm } from "./box-input";

vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
}));
vi.mock("../input-icon-colors", () => ({
  ICON_COLORS: { inactive: "#999" },
}));

const unlinkedValue = { t: "5px", r: "10px", b: "5px", l: "10px" };
const linkedValue = { common: "8px" };

const baseProps = {
  displayName: "Padding",
  propertyName: "padding",
  inputType: "box" as any,
  value: unlinkedValue as any,
  defaultValue: unlinkedValue as any,
  onChange: vi.fn(),
};

describe("BoxInputForm", () => {
  it("renders the displayName label", () => {
    render(<BoxInputForm {...baseProps} />);
    expect(screen.getByText("Padding")).toBeInTheDocument();
  });

  it("renders 4 separate fields in unlinked mode", () => {
    render(<BoxInputForm {...baseProps} />);
    expect(screen.getAllByTestId("field-no-label")).toHaveLength(4);
  });

  it("renders a single common field in linked mode", () => {
    render(<BoxInputForm {...baseProps} value={linkedValue as any} />);
    expect(screen.getAllByTestId("field-no-label")).toHaveLength(1);
  });

  it("renders the link button", () => {
    render(<BoxInputForm {...baseProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onChange with common value when switching to linked mode", async () => {
    const onChange = vi.fn();
    render(<BoxInputForm {...baseProps} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ common: expect.any(String) })
    );
  });
});
