import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LayoutChildrenInputForm } from "./layout-children-input";

vi.mock("../input-utils", () => ({
  getSelectField: (label: string) => (
    <div data-testid={`select-${label}`}>{label}</div>
  ),
  getButtonGroupField: (
    label: string,
    _value: string,
    onChange: (v: string) => void,
    options: { value: string; label: string }[]
  ) => (
    <div>
      <span>{label}</span>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  ),
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label}`}>{label}</div>
  ),
}));

const baseValue = {
  type: "column",
  align: "start",
  justify: "start",
  wrap: "nowrap",
  itemsGap: {
    type: "common",
    commonValue: "0px",
    eachValues: [],
  },
};

const baseProps = {
  displayName: "Layout",
  propertyName: "layout",
  inputType: "layout-children" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("LayoutChildrenInputForm", () => {
  it("renders Type, Align, Justify, Wrap selects", () => {
    render(<LayoutChildrenInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Type")).toBeInTheDocument();
    expect(screen.getByTestId("select-Align")).toBeInTheDocument();
    expect(screen.getByTestId("select-Justify")).toBeInTheDocument();
    expect(screen.getByTestId("select-Wrap")).toBeInTheDocument();
  });

  it("renders Gap Common/Each buttons", () => {
    render(<LayoutChildrenInputForm {...baseProps} />);
    expect(screen.getByRole("button", { name: "Common" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Each" })).toBeInTheDocument();
  });

  it("renders Common gap field when itemsGap type is common", () => {
    render(<LayoutChildrenInputForm {...baseProps} />);
    expect(screen.getByTestId("field-Common")).toBeInTheDocument();
  });

  it("renders per-object gap fields when itemsGap type is each", () => {
    const eachValue = {
      ...baseValue,
      itemsGap: { type: "each", commonValue: "0px", eachValues: ["4px"] },
    };
    const layerData = { objects: [{ id: "a" }, { id: "b" }] as any };
    render(
      <LayoutChildrenInputForm
        {...baseProps}
        value={eachValue as any}
        layerData={layerData}
      />
    );
    expect(screen.getByTestId("field-Gap 1")).toBeInTheDocument();
  });
});
