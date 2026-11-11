import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SizeUnitInputForm } from "./size-unit-input";

vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
}));

const baseValue = { width: "200px", height: "100px", keepAspectRatio: false };

const baseProps = {
  displayName: "Size",
  propertyName: "size",
  inputType: "size" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  inputProps: {} as any,
  onChange: vi.fn(),
};

describe("SizeUnitInputForm", () => {
  it("renders W and H form group labels by default", () => {
    render(<SizeUnitInputForm {...baseProps} />);
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  it("uses custom labelW and labelH when provided via inputProps", () => {
    render(
      <SizeUnitInputForm
        {...baseProps}
        inputProps={{ labelW: "Width", labelH: "Height" } as any}
      />
    );
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByText("Height")).toBeInTheDocument();
  });

  it("renders a numeric field for width and height", () => {
    render(<SizeUnitInputForm {...baseProps} />);
    expect(screen.getAllByTestId("field-no-label")).toHaveLength(2);
  });
});
