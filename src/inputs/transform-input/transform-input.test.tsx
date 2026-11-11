import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimelinesInputForm } from "./transform-input";

vi.mock("react-draggable", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
  getSelectField: (label: string) => (
    <div data-testid={`select-${label || "no-label"}`}>{label}</div>
  ),
}));
vi.mock("../input-factory", () => ({
  getInputForm: () => null,
}));
vi.mock("./transform.definition", () => ({
  getDefaultPoint: () => ({ time: "0ms", enabled: true, pointValue: null }),
  getDefaultTimeline: (name: string, prop: string) => ({
    propertyName: name,
    property: prop,
    ease: "linear",
    points: [
      { time: "0ms", enabled: true, pointValue: null },
      { time: "1000ms", enabled: true, pointValue: null },
    ],
  }),
}));
vi.mock("webslider-sdk/lib/objects/object-utils", () => ({
  convertTimeUnitToMs: (v: string) => {
    if (!v) return 0;
    if (v.endsWith("ms")) return parseInt(v);
    if (v.endsWith("s")) return parseInt(v) * 1000;
    return 0;
  },
}));
vi.mock("webslider-sdk/lib/animations/i-animation-types", () => ({
  AnimeJSEasingOptions: [{ label: "linear", value: "linear" }],
}));
vi.mock("lodash-es", async () => {
  const actual = await vi.importActual("lodash-es");
  const debounceFn = (fn: any) => {
    const d = (...args: any[]) => fn(...args);
    d.flush = () => {};
    d.cancel = () => {};
    return d;
  };
  return { ...(actual as any), debounce: debounceFn };
});

const baseValue = {
  maxDuration: "2000ms",
  timelines: [],
};

const baseProps = {
  displayName: "Transform",
  propertyName: "transform",
  inputType: "timelines" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("TimelinesInputForm", () => {
  it("renders Max duration field", () => {
    render(<TimelinesInputForm {...baseProps} />);
    expect(screen.getByTestId("field-Max duration")).toBeInTheDocument();
  });

  it("renders the Add timeline select", () => {
    render(<TimelinesInputForm {...baseProps} />);
    expect(screen.getByDisplayValue("Add timeline for...")).toBeInTheDocument();
  });

  it("renders Delete timeline button", () => {
    render(<TimelinesInputForm {...baseProps} />);
    expect(screen.getByText("Delete timeline")).toBeInTheDocument();
  });

  it("Delete timeline button is disabled when no timelines exist", () => {
    render(<TimelinesInputForm {...baseProps} />);
    expect(screen.getByText("Delete timeline").closest("button")).toBeDisabled();
  });
});
