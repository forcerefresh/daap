import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ClipMaskInputForm } from "./clip-mask-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (displayName: string) => displayName,
}));
vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
}));

const baseValue = {
  point: [
    { x: "0%", y: "0%" },
    { x: "100%", y: "0%" },
    { x: "100%", y: "100%" },
    { x: "0%", y: "100%" },
  ],
};

const baseProps = {
  displayName: "Clip",
  propertyName: "clip",
  inputType: "clip-mask" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("ClipMaskInputForm", () => {
  it("renders the displayName label", () => {
    render(<ClipMaskInputForm {...baseProps} />);
    expect(screen.getByText("Clip")).toBeInTheDocument();
  });

  it("renders X and Y fields for each point", () => {
    render(<ClipMaskInputForm {...baseProps} />);
    expect(screen.getAllByTestId("field-X")).toHaveLength(4);
    expect(screen.getAllByTestId("field-Y")).toHaveLength(4);
  });

  it("renders point index labels", () => {
    render(<ClipMaskInputForm {...baseProps} />);
    expect(screen.getByText("0.")).toBeInTheDocument();
    expect(screen.getByText("3.")).toBeInTheDocument();
  });
});
