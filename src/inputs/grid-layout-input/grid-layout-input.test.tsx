import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GridPlacementInputForm } from "./grid-layout-input";

vi.mock("../input-utils", () => ({
  getNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
  getButtonGroupField: (
    _label: string,
    value: string,
    onChange: (v: string) => void,
    options: { value: string; label: string }[]
  ) => (
    <div>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("../../store/reducers/settings", () => ({
  getIconByType: () => "desktop",
}));
vi.mock("../../panels/action-panel/ActionPanel", () => ({
  getIconSize: () => ({ w: 16, h: 16 }),
}));
vi.mock("../../utils/icons/responsive-icons-factory", () => ({
  getResponsiveIcon: () => null,
}));

const commonValue = {
  type: "common",
  common: { left: 1, top: 1, width: 100, height: 50 },
  perDevice: [],
};

const baseProps = {
  displayName: "Grid",
  propertyName: "grid",
  inputType: "grid-layout" as any,
  value: commonValue as any,
  defaultValue: commonValue as any,
  onChange: vi.fn(),
};

describe("GridPlacementInputForm", () => {
  it("renders Common and Per device buttons", () => {
    render(<GridPlacementInputForm {...baseProps} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
    expect(screen.getByText("Per device")).toBeInTheDocument();
  });

  it("renders Left, Width, Top, Height fields in common mode", () => {
    render(<GridPlacementInputForm {...baseProps} />);
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByText("Top")).toBeInTheDocument();
    expect(screen.getByText("Height")).toBeInTheDocument();
  });

  it("does not render numeric inputs in perDevice mode with empty breakpoints", () => {
    const perDeviceValue = { ...commonValue, type: "perDevice" };
    render(<GridPlacementInputForm {...baseProps} value={perDeviceValue as any} />);
    expect(screen.queryByTestId("field-Left")).not.toBeInTheDocument();
  });
});
