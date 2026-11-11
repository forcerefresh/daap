import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { InsetLayoutInputForm } from "./inset-layout-input";

vi.mock("../input-utils", () => ({
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
  getSelectField: (label: string) => (
    <div data-testid={`select-${label}`}>{label}</div>
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
  common: { left: "0px", right: "0px", top: "0px", bottom: "0px" },
  perDevice: [],
  relativeTo: "page",
};

const baseProps = {
  displayName: "Inset",
  propertyName: "inset",
  inputType: "inset-layout" as any,
  value: commonValue as any,
  defaultValue: commonValue as any,
  onChange: vi.fn(),
};

describe("InsetLayoutInputForm", () => {
  it("renders Common and Per device buttons", () => {
    render(<InsetLayoutInputForm {...baseProps} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
    expect(screen.getByText("Per device")).toBeInTheDocument();
  });

  it("renders Left, Right, Top, Bottom fields in common mode", () => {
    render(<InsetLayoutInputForm {...baseProps} />);
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(screen.getByText("Top")).toBeInTheDocument();
    expect(screen.getByText("Bottom")).toBeInTheDocument();
  });

  it("renders Relative select", () => {
    render(<InsetLayoutInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Relative")).toBeInTheDocument();
  });

  it("does not render inset fields in perDevice mode", () => {
    const perDeviceValue = { ...commonValue, type: "perDevice" };
    render(<InsetLayoutInputForm {...baseProps} value={perDeviceValue as any} />);
    expect(screen.queryByText("Left")).not.toBeInTheDocument();
  });
});
