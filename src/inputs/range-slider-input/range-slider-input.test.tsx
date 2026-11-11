import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RangeSliderInputForm } from "./range-slider-input";

vi.mock("lodash-es", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lodash-es")>();
  const mockDebounce = (fn: any) => {
    const d = (...args: any[]) => fn(...args);
    d.flush = () => {};
    d.cancel = () => {};
    return d;
  };
  return { ...actual, debounce: mockDebounce };
});

const baseProps = {
  displayName: "Range",
  propertyName: "range",
  inputType: "range-slider" as any,
  defaultValue: [0, 100] as [number, number],
  value: [20, 80] as [number, number],
  onChange: vi.fn(),
};

describe("RangeSliderInputForm", () => {
  it("renders the label", () => {
    render(<RangeSliderInputForm {...baseProps} />);
    expect(screen.getByText("Range")).toBeInTheDocument();
  });

  it("renders two slider handles", () => {
    render(<RangeSliderInputForm {...baseProps} />);
    const handles = screen.getAllByRole("slider");
    expect(handles).toHaveLength(2);
  });

  it("reflects the start and end values on the handles", () => {
    render(<RangeSliderInputForm {...baseProps} value={[20, 80]} />);
    const [startHandle, endHandle] = screen.getAllByRole("slider");
    expect(startHandle).toHaveAttribute("aria-valuenow", "20");
    expect(endHandle).toHaveAttribute("aria-valuenow", "80");
  });
});
