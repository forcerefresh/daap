import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ButtonGroupInputForm } from "./button-group-input";

const options = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const baseProps = {
  displayName: "Align",
  propertyName: "align",
  inputType: "button-group" as any,
  value: "left",
  defaultValue: "left",
  options,
  onChange: vi.fn(),
};

describe("ButtonGroupInputForm", () => {
  it("renders the displayName label", () => {
    render(<ButtonGroupInputForm {...baseProps} />);
    expect(screen.getByText("Align")).toBeInTheDocument();
  });

  it("renders a button for each option", () => {
    render(<ButtonGroupInputForm {...baseProps} />);
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Center")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
  });

  it("marks the active option button", () => {
    render(<ButtonGroupInputForm {...baseProps} />);
    expect(screen.getByText("Left").closest("button")).toHaveClass("bp5-active");
    expect(screen.getByText("Center").closest("button")).not.toHaveClass("bp5-active");
  });

  it("calls onChange with the selected value when a button is clicked", async () => {
    const onChange = vi.fn();
    render(<ButtonGroupInputForm {...baseProps} onChange={onChange} />);
    await userEvent.click(screen.getByText("Center"));
    expect(onChange).toHaveBeenCalledWith("center");
  });
});
