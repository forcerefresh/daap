import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ColorArrayInputForm } from "./color-array-input";

vi.mock("../input-utils", () => ({
  getColorField: () => <div data-testid="color-field" />,
}));

const baseValue = [
  { r: 255, g: 0, b: 0, a: 1 },
  { r: 0, g: 255, b: 0, a: 1 },
];

const baseProps = {
  displayName: "Colors",
  propertyName: "colors",
  inputType: "color-array" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("ColorArrayInputForm", () => {
  it("renders the displayName label for the first item", () => {
    render(<ColorArrayInputForm {...baseProps} />);
    expect(screen.getByText("Colors")).toBeInTheDocument();
  });

  it("renders a color field for each color in the array", () => {
    render(<ColorArrayInputForm {...baseProps} />);
    expect(screen.getAllByTestId("color-field")).toHaveLength(2);
  });

  it("shows delete buttons when there are multiple colors", () => {
    render(<ColorArrayInputForm {...baseProps} />);
    // 2 delete icon-only buttons + 1 "Add color" button
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("calls onChange with a new color appended when Add color is clicked", async () => {
    const onChange = vi.fn();
    render(<ColorArrayInputForm {...baseProps} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /add color/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        ...baseValue,
        expect.objectContaining({ r: expect.any(Number) }),
      ])
    );
  });
});
