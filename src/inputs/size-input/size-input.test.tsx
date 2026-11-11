import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SizeInputForm } from "./size-input";

vi.mock("../input-icon-colors", () => ({
  ICON_COLORS: { inactive: "#999" },
}));

const baseValue = { width: 200, height: 100, keepAspectRatio: false };

const baseProps = {
  displayName: "Size",
  propertyName: "size",
  inputType: "size" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("SizeInputForm", () => {
  it("renders W and H labels", () => {
    render(<SizeInputForm {...baseProps} />);
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  it("shows the initial width and height values", () => {
    render(<SizeInputForm {...baseProps} />);
    expect(screen.getByDisplayValue("200")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
  });

  it("calls onChange when width input changes", () => {
    const onChange = vi.fn();
    render(<SizeInputForm {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("200"), {
      target: { value: "300" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ width: 300 })
    );
  });

  it("renders the aspect ratio link button", () => {
    render(<SizeInputForm {...baseProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
