import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CornerRadiusInputForm } from "./corner-radius-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (displayName: string) => displayName,
}));
vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
}));
vi.mock("../input-icon-colors", () => ({
  ICON_COLORS: { inactive: "#999" },
}));

const unlinkedValue = { tl: "4px", tr: "4px", bl: "4px", br: "4px" };
const linkedValue = "8px";

const baseProps = {
  displayName: "Corner Radius",
  propertyName: "cornerRadius",
  inputType: "corner-radius" as any,
  value: unlinkedValue as any,
  defaultValue: unlinkedValue as any,
  onChange: vi.fn(),
};

describe("CornerRadiusInputForm", () => {
  it("renders TL, TR, BL, BR fields in unlinked mode", () => {
    render(<CornerRadiusInputForm {...baseProps} />);
    expect(screen.getByTestId("field-TL")).toBeInTheDocument();
    expect(screen.getByTestId("field-TR")).toBeInTheDocument();
    expect(screen.getByTestId("field-BL")).toBeInTheDocument();
    expect(screen.getByTestId("field-BR")).toBeInTheDocument();
  });

  it("renders single common field in linked mode", () => {
    render(<CornerRadiusInputForm {...baseProps} value={linkedValue as any} />);
    expect(screen.getByTestId("field-no-label")).toBeInTheDocument();
    expect(screen.queryByTestId("field-TL")).not.toBeInTheDocument();
  });

  it("calls onChange with object when switching from linked to unlinked", async () => {
    const onChange = vi.fn();
    render(
      <CornerRadiusInputForm
        {...baseProps}
        value={linkedValue as any}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ tl: expect.any(String) })
    );
  });

  it("calls onChange with string when switching from unlinked to linked", async () => {
    const onChange = vi.fn();
    render(<CornerRadiusInputForm {...baseProps} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(expect.any(String));
  });
});
