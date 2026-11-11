import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RelativePositionInputForm } from "./relative-position-input";

vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
}));

const baseProps = {
  displayName: "Translate X",
  propertyName: "translateX",
  inputType: "relative-position" as any,
  value: { value: "10px" } as any,
  defaultValue: { value: "0px" } as any,
  onChange: vi.fn(),
};

describe("RelativePositionInputForm", () => {
  it("renders the displayName label", () => {
    render(<RelativePositionInputForm {...baseProps} />);
    expect(screen.getByText("Translate X")).toBeInTheDocument();
  });

  it("renders the numeric field", () => {
    render(<RelativePositionInputForm {...baseProps} />);
    expect(screen.getByTestId("field-no-label")).toBeInTheDocument();
  });
});
