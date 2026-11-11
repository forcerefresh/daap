import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { NumberInputForm } from "./number-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));

const baseProps = {
  displayName: "Opacity",
  propertyName: "opacity",
  inputType: "number" as any,
  defaultValue: 0,
  value: 50,
  onInput: vi.fn(),
};

describe("NumberInputForm", () => {
  it("renders the label", () => {
    render(<NumberInputForm {...baseProps} />);
    expect(screen.getByText("Opacity")).toBeInTheDocument();
  });

  it("calls onInput with parsed float on value change", async () => {
    const onInput = vi.fn();
    render(<NumberInputForm {...baseProps} onInput={onInput} />);
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "75");
    expect(onInput).toHaveBeenCalledWith(75);
  });

  it("calls onInput with previous value when input is not a valid number", async () => {
    const onInput = vi.fn();
    render(<NumberInputForm {...baseProps} value={50} onInput={onInput} />);
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "abc");
    expect(onInput).toHaveBeenCalledWith(50);
  });

  it("respects min constraint from inputProps", async () => {
    const onInput = vi.fn();
    render(
      <NumberInputForm
        {...baseProps}
        onInput={onInput}
        inputProps={{ min: 0 } as any}
      />
    );
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "-5");
    expect(onInput).toHaveBeenCalledWith(50);
  });
});
