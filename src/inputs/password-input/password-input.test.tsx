import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PasswordInputForm } from "./password-input";

vi.mock("../input-utils", () => ({
  getUnderFieldText: () => undefined,
}));

const baseProps = {
  displayName: "API Key",
  propertyName: "apiKey",
  inputType: "password" as any,
  defaultValue: "",
  value: "secret",
  onChange: vi.fn(),
};

describe("PasswordInputForm", () => {
  it("renders the label", () => {
    render(<PasswordInputForm {...baseProps} />);
    expect(screen.getByText("API Key")).toBeInTheDocument();
  });

  it("renders as password type by default", () => {
    render(<PasswordInputForm {...baseProps} />);
    expect(screen.getByDisplayValue("secret")).toHaveAttribute("type", "password");
  });

  it("toggles to text type when Show key is checked", async () => {
    render(<PasswordInputForm {...baseProps} />);
    const toggle = screen.getByRole("checkbox", { name: /show key/i });
    await userEvent.click(toggle);
    expect(screen.getByDisplayValue("secret")).toHaveAttribute("type", "text");
  });

  it("calls onChange with new value on change", () => {
    const onChange = vi.fn();
    const { container } = render(<PasswordInputForm {...baseProps} value="" onChange={onChange} />);
    fireEvent.change(container.querySelector("input[type='password']")!, {
      target: { value: "newsecret" },
    });
    expect(onChange).toHaveBeenCalledWith("newsecret");
  });
});
