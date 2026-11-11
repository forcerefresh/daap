import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CheckboxInputForm } from "./checkbox-input";

const baseProps = {
  displayName: "Visible",
  propertyName: "visible",
  inputType: "checkbox" as any,
  defaultValue: false,
  value: false,
  onChange: vi.fn(),
  inputProps: {},
};

describe("CheckboxInputForm", () => {
  it("renders the label", () => {
    render(<CheckboxInputForm {...baseProps} />);
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("renders unchecked by default", () => {
    render(<CheckboxInputForm {...baseProps} value={false} />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders checked when value is true", () => {
    render(<CheckboxInputForm {...baseProps} value={true} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange with true when checked", async () => {
    const onChange = vi.fn();
    render(<CheckboxInputForm {...baseProps} value={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when unchecked", async () => {
    const onChange = vi.fn();
    render(<CheckboxInputForm {...baseProps} value={true} onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
