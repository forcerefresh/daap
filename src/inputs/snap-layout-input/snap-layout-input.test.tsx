import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SnapInputForm } from "./snap-layout-input";

vi.mock("../input-utils", () => ({
  getSelectField: (label: string) => (
    <div data-testid={`select-${label || "no-label"}`}>{label}</div>
  ),
  getSizeUnitLayoutField: (label: string) => (
    <div data-testid={`size-unit-${label || "no-label"}`}>{label}</div>
  ),
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
  getButtonGroupField: (
    _label: string,
    _value: string,
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
  common: {
    edge: "top",
    width: "100px",
    height: "100px",
    offsetX: "0px",
    offsetY: "0px",
  },
  perDevice: [],
  relativeTo: "page",
};

const baseProps = {
  displayName: "Snap",
  propertyName: "snap",
  inputType: "snap-layout" as any,
  value: commonValue as any,
  defaultValue: commonValue as any,
  onChange: vi.fn(),
};

describe("SnapInputForm", () => {
  it("renders Relative select", () => {
    render(<SnapInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Relative")).toBeInTheDocument();
  });

  it("renders Common and Per device buttons", () => {
    render(<SnapInputForm {...baseProps} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
    expect(screen.getByText("Per device")).toBeInTheDocument();
  });

  it("renders Snap to and Size in common mode", () => {
    render(<SnapInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Snap to")).toBeInTheDocument();
    expect(screen.getByTestId("size-unit-Size")).toBeInTheDocument();
  });

  it("renders Offset X and Offset Y fields in common mode", () => {
    render(<SnapInputForm {...baseProps} />);
    expect(screen.getByText("Offset X")).toBeInTheDocument();
    expect(screen.getByText("Offset Y")).toBeInTheDocument();
  });
});
