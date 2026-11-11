import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ParallaxInputForm } from "./parallax-input";

vi.mock("../input-utils", () => ({
  getButtonGroupField: (
    label: string,
    _value: string,
    _onChange: (v: string) => void,
    options: { value: string; label: string }[]
  ) => (
    <div>
      <span data-testid="btn-group-label">{label}</span>
      {options.map((o) => (
        <button key={o.value}>{o.label}</button>
      ))}
    </div>
  ),
  getNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
  getSelectField: (label: string) => (
    <div data-testid={`select-${label || "no-label"}`}>{label}</div>
  ),
  getTextField: (label: string) => (
    <div data-testid={`text-${label || "no-label"}`}>{label}</div>
  ),
}));

const baseValue = {
  depthType: "auto",
  autoDepthInc: 5,
  objects: [],
  strength: 3,
  followTime: 100,
  trigger: "window",
  customScrollbarSelector: "",
};

const baseProps = {
  displayName: "Parallax",
  propertyName: "parallax",
  inputType: "parallax" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("ParallaxInputForm", () => {
  it("renders the displayName label", () => {
    render(<ParallaxInputForm {...baseProps} />);
    expect(screen.getByText("Parallax")).toBeInTheDocument();
  });

  it("renders Auto and Custom depth buttons", () => {
    render(<ParallaxInputForm {...baseProps} />);
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("renders Strength and Follow time fields", () => {
    render(<ParallaxInputForm {...baseProps} />);
    expect(screen.getByTestId("field-Strength")).toBeInTheDocument();
    expect(screen.getByTestId("field-Follow time")).toBeInTheDocument();
  });

  it("renders Trigger select", () => {
    render(<ParallaxInputForm {...baseProps} />);
    expect(screen.getByTestId("select-Trigger")).toBeInTheDocument();
  });

  it("renders Increment field and not Custom depths label in auto mode", () => {
    render(<ParallaxInputForm {...baseProps} />);
    expect(screen.getByTestId("field-Increment")).toBeInTheDocument();
    expect(screen.queryByText("Object depths")).not.toBeInTheDocument();
  });

  it("renders Object depths label in custom mode", () => {
    const customValue = { ...baseValue, depthType: "custom" };
    render(<ParallaxInputForm {...baseProps} value={customValue as any} />);
    expect(screen.getByText("Object depths")).toBeInTheDocument();
  });

  it("renders custom selector field when trigger is custom", () => {
    const customTriggerValue = { ...baseValue, trigger: "custom" };
    render(
      <ParallaxInputForm {...baseProps} value={customTriggerValue as any} />
    );
    expect(screen.getByTestId("text-Custom selector")).toBeInTheDocument();
  });
});
