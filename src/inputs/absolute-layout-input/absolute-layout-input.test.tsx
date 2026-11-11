import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AbsolutePlacementForm } from "./absolute-layout-input";

vi.mock("../input-utils", () => ({
  getUnitNumericFiled: (label: string) => (
    <div data-testid={`field-${label || "no-label"}`}>{label}</div>
  ),
  getSizePosLayoutField: (label: string) => (
    <div data-testid="size-pos-field">{label}</div>
  ),
}));
vi.mock("../input-icon-colors", () => ({
  ICON_COLORS: { inactive: "#999" },
}));
vi.mock("../../store/reducers/settings", () => ({
  getIconByType: () => "desktop",
}));
vi.mock("../../panels/action-panel/ActionPanel", () => ({
  getIconSize: () => ({ w: 16, h: 16 }),
}));
vi.mock("../../utils/icons/responsive-icons-factory", () => ({
  getResponsiveIcon: () => null,
}));
vi.mock("../../utils/doom-utils/common", () => ({
  roundNumber: (v: number) => v,
}));

const baseValue = {
  type: "common",
  common: { left: "10px", top: "20px", width: "200px", height: "100px" },
  perDevice: [],
};

const baseProps = {
  displayName: "Position",
  propertyName: "position",
  inputType: "absolute-layout" as any,
  value: baseValue as any,
  defaultValue: baseValue as any,
  onChange: vi.fn(),
};

describe("AbsolutePlacementForm", () => {
  it("renders X, Y, W, H fields", () => {
    render(<AbsolutePlacementForm {...baseProps} />);
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("Y")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  it("renders the aspect ratio link button", () => {
    render(<AbsolutePlacementForm {...baseProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("toggles keep-aspect-ratio on button click", async () => {
    render(<AbsolutePlacementForm {...baseProps} />);
    const btn = screen.getByRole("button");
    expect(btn).not.toHaveClass("bp5-active");
    await userEvent.click(btn);
    expect(btn).toHaveClass("bp5-active");
  });
});
