import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SliderInputForm } from "./slider-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));

vi.mock("lodash-es", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lodash-es")>();
  return { ...actual, throttle: (fn: any) => fn };
});

const baseProps = {
  displayName: "Scale",
  propertyName: "scale",
  inputType: "slider" as any,
  defaultValue: 0,
  value: 50,
  onChange: vi.fn(),
};

describe("SliderInputForm", () => {
  it("renders the label", () => {
    render(<SliderInputForm {...baseProps} />);
    expect(screen.getByText("Scale")).toBeInTheDocument();
  });

  it("renders a slider with the current value", () => {
    render(<SliderInputForm {...baseProps} value={50} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
  });

  it("renders slider within configured min/max range", () => {
    render(
      <SliderInputForm
        {...baseProps}
        value={30}
        inputProps={{ min: 0, max: 200 } as any}
      />
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "200");
  });
});
