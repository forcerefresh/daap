import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SelectInputForm } from "./select-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));

vi.mock("../input-utils", () => ({
  getUnderFieldText: () => undefined,
}));

const options = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const baseProps = {
  displayName: "Align",
  propertyName: "align",
  inputType: "select" as any,
  defaultValue: "left",
  value: "left",
  options,
  onChange: vi.fn(),
};

describe("SelectInputForm", () => {
  it("renders the label", () => {
    render(<SelectInputForm {...baseProps} />);
    expect(screen.getByText("Align")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<SelectInputForm {...baseProps} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Left" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Center" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Right" })).toBeInTheDocument();
  });

  it("shows current value as selected", () => {
    render(<SelectInputForm {...baseProps} value="center" />);
    expect(screen.getByRole("combobox")).toHaveValue("center");
  });

  it("calls onChange when a new option is selected", async () => {
    const onChange = vi.fn();
    render(<SelectInputForm {...baseProps} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "right");
    expect(onChange).toHaveBeenCalledWith("right");
  });

  it("shows customReadonlySelectedLabel when provided", () => {
    render(
      <SelectInputForm
        {...baseProps}
        customReadonlySelectedLabel="Mixed"
      />
    );
    expect(screen.getByRole("option", { name: "Mixed" })).toBeInTheDocument();
  });
});
