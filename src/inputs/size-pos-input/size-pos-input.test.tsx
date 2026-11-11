import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SizePosInputForm } from "./size-pos-input";

vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
}));
vi.mock("../input-icon-colors", () => ({
  ICON_COLORS: { inactive: "#999" },
}));

const baseValue = {
  left: "10px",
  top: "20px",
  width: "200px",
  height: "100px",
  keepAspectRatio: false,
};

const baseProps = {
  displayName: "Position & Size",
  propertyName: "sizePos",
  inputType: "size-pos" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("SizePosInputForm", () => {
  it("renders X, Y, W, H fields", () => {
    render(<SizePosInputForm {...baseProps} />);
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("Y")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  it("renders the aspect ratio link button", () => {
    render(<SizePosInputForm {...baseProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
