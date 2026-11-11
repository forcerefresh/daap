import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextAreaInputForm } from "./textarea-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));

vi.mock("lodash-es", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lodash-es")>();
  return { ...actual, debounce: (fn: any) => fn };
});

const baseProps = {
  displayName: "Content",
  propertyName: "content",
  inputType: "textarea" as any,
  defaultValue: "",
  value: "initial text",
  onInput: vi.fn(),
};

describe("TextAreaInputForm", () => {
  it("renders the label", () => {
    render(<TextAreaInputForm {...baseProps} />);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders the current value", () => {
    render(<TextAreaInputForm {...baseProps} />);
    expect(screen.getByRole("textbox")).toHaveValue("initial text");
  });

  it("calls onInput on change (debounce mocked as passthrough)", () => {
    const onInput = vi.fn();
    render(<TextAreaInputForm {...baseProps} value="" onInput={onInput} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "typed" } });
    expect(onInput).toHaveBeenCalledWith("typed");
  });

  it("calls onInput immediately when disableDebounce is set", () => {
    const onInput = vi.fn();
    render(
      <TextAreaInputForm
        {...baseProps}
        value=""
        onInput={onInput}
        inputProps={{ disableDebounce: true } as any}
      />
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "x" } });
    expect(onInput).toHaveBeenCalledWith("x");
  });
});
