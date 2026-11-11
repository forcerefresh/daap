import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("../panels/action-panel/ActionPanel", () => ({
  getIconSize: () => ({ w: 16, h: 16 }),
}));
vi.mock("../store/reducers/settings", () => ({
  getIconByType: () => "desktop",
}));
vi.mock("../utils/icons/responsive-icons-factory", () => ({
  getResponsiveIcon: () => <span data-testid="responsive-icon" />,
}));

import { createInputLabel } from "./input-helpers";

describe("createInputLabel", () => {
  it("returns the plain label when propertyName has no _D_ suffix", () => {
    expect(createInputLabel("Width", "width")).toBe("Width");
  });

  it("renders a device icon when propertyName has _D_ suffix", () => {
    const result = createInputLabel("Width", "width_D_desktop");
    render(<>{result}</>);
    expect(screen.getByTestId("responsive-icon")).toBeInTheDocument();
  });

  it("does not render the label text when removeLayedForDevice is true (default)", () => {
    const result = createInputLabel("Width", "width_D_desktop");
    render(<>{result}</>);
    expect(screen.queryByText("Width")).not.toBeInTheDocument();
  });

  it("renders both icon and label when removeLayedForDevice is false", () => {
    const result = createInputLabel("Width", "width_D_desktop", false);
    render(<>{result}</>);
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-icon")).toBeInTheDocument();
  });
});
