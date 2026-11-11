import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ColorInputForm from "./color-input";

vi.mock("react-redux", () => ({
  connect: () => (Component: any) => Component,
}));
vi.mock("../input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));
vi.mock("../../panels/color-panel/ColorPanel", () => ({
  default: () => <div data-testid="color-panel" />,
}));
vi.mock("./transparent-bg.svg?react", () => ({ default: () => null }));
vi.mock("../../utils/hooks/on-click-outside", () => ({ default: () => {} }));
vi.mock("../../store/actions/actions", () => ({
  addRecentColor: vi.fn(),
  collectColors: vi.fn(),
}));
vi.mock("../../store/store", () => ({}));

const baseProps = {
  displayName: "Fill Color",
  propertyName: "fillColor",
  inputType: "color" as any,
  value: { r: 255, g: 0, b: 0, a: 1 },
  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
  onChange: vi.fn(),
  recentColors: [],
  usedInDocument: [],
  _addRecentColor: vi.fn(),
  _collectColors: vi.fn(),
};

describe("ColorInputForm", () => {
  it("renders the label", () => {
    render(<ColorInputForm {...baseProps} />);
    expect(screen.getByText("Fill Color")).toBeInTheDocument();
  });

  it("shows the color swatch when a color value is set", () => {
    const { container } = render(<ColorInputForm {...baseProps} />);
    expect(container.querySelector('[id="color-input"]')).toBeInTheDocument();
    expect(container.querySelector('[data-icon="disable"]')).not.toBeInTheDocument();
  });

  it("shows the disable icon when value is undefined", () => {
    const { container } = render(<ColorInputForm {...baseProps} value={undefined as any} />);
    expect(container.querySelector('[data-icon="disable"]')).toBeInTheDocument();
  });

  it("opens the color panel on swatch click", async () => {
    render(<ColorInputForm {...baseProps} />);
    await userEvent.click(document.getElementById("color-input")!);
    expect(screen.getByTestId("color-panel")).toBeInTheDocument();
  });
});
