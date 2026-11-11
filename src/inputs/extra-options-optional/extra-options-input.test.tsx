import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ExtraOptionsInput from "./extra-options-input";

vi.mock("react-redux", () => ({
  connect: () => (Component: any) => Component,
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
vi.mock("../input-icon-colors", () => ({
  ICON_COLORS: { enabled: "#0f0", disabled: "#999", neutral: "#ccc", danger: "#f00" },
}));

const baseMetadata = { disabled: false, exportForWizard: false };
const baseBreakpoints = { breakpointsConfiguration: [] };

const baseProps = {
  children: <div data-testid="child">child content</div>,
  metadataValues: baseMetadata as any,
  onMetadataChange: vi.fn(),
  breakpointsConfiguration: baseBreakpoints as any,
};

describe("ExtraOptionsInput", () => {
  it("returns null when extraOptions is not provided", () => {
    const { container } = render(<ExtraOptionsInput {...baseProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders children when extraOptions is provided", () => {
    render(
      <ExtraOptionsInput {...baseProps} extraOptions={{ optional: true } as any} />
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders the options button when extraOptions is provided", () => {
    render(
      <ExtraOptionsInput {...baseProps} extraOptions={{ optional: true } as any} />
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
