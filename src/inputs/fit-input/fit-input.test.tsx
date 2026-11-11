import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FitInputForm } from "./fit-input";

vi.mock("../input-utils", () => ({
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
    <div data-testid={`select-${label || "no-label"}`}>{label}</div>
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
  common: { relativeTo: "page" },
  perDevice: [],
};

const baseProps = {
  displayName: "Fit",
  propertyName: "fit",
  inputType: "fit" as any,
  value: commonValue as any,
  defaultValue: commonValue as any,
  onChange: vi.fn(),
};

describe("FitInputForm", () => {
  it("renders Common and Per device buttons", () => {
    render(<FitInputForm {...baseProps} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
    expect(screen.getByText("Per device")).toBeInTheDocument();
  });

  it("renders Relative select in common mode", () => {
    render(<FitInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Relative")).toBeInTheDocument();
  });

  it("renders disabled Relative select when relativeToLayer is set", () => {
    render(<FitInputForm {...baseProps} relativeToLayer={"layer-1" as any} />);
    expect(screen.getByTestId("select-Relative")).toBeInTheDocument();
    expect(screen.queryByText("Common")).not.toBeInTheDocument();
  });
});
