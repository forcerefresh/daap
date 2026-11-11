import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SplitInputForm } from "./split-input";

vi.mock("react-draggable", () => ({
  default: ({ children }: any) => <div data-testid="draggable">{children}</div>,
}));

const validValue = {
  center: { x: 50, y: 50 },
  points: [
    { x: 0, y: 25 },
    { x: 50, y: 100 },
    { x: 100, y: 75 },
    { x: 50, y: 0 },
  ],
};

const invalidValue = {
  center: { x: 50, y: 50 },
  points: [{ x: 0, y: 25 }, { x: 50, y: 100 }],
};

const baseProps = {
  displayName: "Split",
  propertyName: "split",
  inputType: "split" as any,
  value: validValue as any,
  defaultValue: validValue as any,
  onChange: vi.fn(),
};

describe("SplitInputForm", () => {
  it("renders the displayName label", () => {
    render(<SplitInputForm {...baseProps} />);
    expect(screen.getByText("Split")).toBeInTheDocument();
  });

  it("renders the draggable center point", () => {
    render(<SplitInputForm {...baseProps} />);
    expect(screen.getByTestId("draggable")).toBeInTheDocument();
  });

  it("does not show validation error with a valid set of points", () => {
    render(<SplitInputForm {...baseProps} />);
    expect(screen.queryByText(/Each side/)).not.toBeInTheDocument();
  });

  it("shows validation error when points are insufficient", () => {
    render(<SplitInputForm {...baseProps} value={invalidValue as any} />);
    expect(screen.getByText(/Each side/)).toBeInTheDocument();
  });
});
