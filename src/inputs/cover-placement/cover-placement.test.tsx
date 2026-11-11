import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CoverPlacementInputForm } from "./cover-placement";

vi.mock("../input-utils", () => ({
  getSelectField: (label: string) => (
    <div data-testid={`select-${label || "no-label"}`}>{label}</div>
  ),
}));

const baseValue = {
  size: "cover",
  positionHorizontal: "center",
  positionVertical: "center",
};

const baseProps = {
  displayName: "Fit",
  propertyName: "fit",
  inputType: "cover-placement" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("CoverPlacementInputForm", () => {
  it("renders the size select using displayName as label", () => {
    render(<CoverPlacementInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Fit")).toBeInTheDocument();
  });

  it("renders H and V position selects by default", () => {
    render(<CoverPlacementInputForm {...baseProps} />);
    expect(screen.getByTestId("select-H")).toBeInTheDocument();
    expect(screen.getByTestId("select-V")).toBeInTheDocument();
  });

  it("hides H and V selects when hidePosition is true", () => {
    render(
      <CoverPlacementInputForm
        {...baseProps}
        inputProps={{ hidePosition: true } as any}
      />
    );
    expect(screen.queryByTestId("select-H")).not.toBeInTheDocument();
    expect(screen.queryByTestId("select-V")).not.toBeInTheDocument();
  });

  it("hides Fit align label when minimal is true", () => {
    render(
      <CoverPlacementInputForm
        {...baseProps}
        inputProps={{ minimal: true } as any}
      />
    );
    expect(screen.queryByText("Fit align")).not.toBeInTheDocument();
  });
});
