import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextInputForm } from "./text-input";

vi.mock("../input-utils", () => ({
  getUnderFieldText: (_helperText: unknown, externalError?: string) =>
    externalError ? <span>{externalError}</span> : undefined,
}));

const baseProps = {
  displayName: "Name",
  propertyName: "name",
  inputType: "text" as any,
  defaultValue: "",
  value: "hello",
  onChange: vi.fn(),
};

describe("TextInputForm", () => {
  it("renders the label", () => {
    render(<TextInputForm {...baseProps} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders the current value", () => {
    render(<TextInputForm {...baseProps} />);
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("calls onChange with the full new value on change", () => {
    const onChange = vi.fn();
    render(<TextInputForm {...baseProps} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "world" } });
    expect(onChange).toHaveBeenCalledWith("world");
  });

  it("shows warning intent when externalError is set", () => {
    render(
      <TextInputForm {...baseProps} externalError="Required" />
    );
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });
});
