import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TransformOriginInputForm } from "./transform-origin";

const baseProps = {
  displayName: "Origin",
  propertyName: "transformOrigin",
  inputType: "transform-origin" as any,
  value: { x: 50, y: 50 },
  defaultValue: { x: 50, y: 50 },
  onChange: vi.fn(),
};

describe("TransformOriginInputForm", () => {
  it("renders the displayName label", () => {
    render(<TransformOriginInputForm {...baseProps} />);
    expect(screen.getByText("Origin")).toBeInTheDocument();
  });

  it("renders the clickable area", () => {
    const { container } = render(<TransformOriginInputForm {...baseProps} />);
    expect(container.querySelector('[class*="area"]')).toBeInTheDocument();
  });

  it("calls onChange when area is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <TransformOriginInputForm {...baseProps} onChange={onChange} />
    );
    const area = container.querySelector('[class*="area"]') as HTMLElement;
    fireEvent.click(area);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }));
  });
});
