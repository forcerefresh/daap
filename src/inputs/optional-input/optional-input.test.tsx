import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { OptionalInput } from "./optional-input";

const baseProps = {
  children: <div data-testid="child">child content</div>,
  metadataValues: { disabled: false, exportForWizard: true } as any,
  onMetadataChange: vi.fn(),
};

describe("OptionalInput", () => {
  it("renders children", () => {
    render(<OptionalInput {...baseProps} />);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders the enabled switch (checked when not disabled)", () => {
    render(<OptionalInput {...baseProps} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders the switch as unchecked when disabled is true", () => {
    render(
      <OptionalInput
        {...baseProps}
        metadataValues={{ disabled: true, exportForWizard: true } as any}
      />
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("calls onMetadataChange with toggled disabled when switch is clicked", () => {
    const onMetadataChange = vi.fn();
    render(<OptionalInput {...baseProps} onMetadataChange={onMetadataChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onMetadataChange).toHaveBeenCalledWith(
      expect.objectContaining({ disabled: true })
    );
  });
});
