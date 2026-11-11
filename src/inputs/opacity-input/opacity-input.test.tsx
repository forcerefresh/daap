import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { OpacityInputForm } from "./opacity-input";

vi.mock("../input-utils", () => ({
  getSelectSlider: () => null,
}));

vi.mock("./transparent-bg.svg?react", () => ({
  default: () => null,
}));

const baseProps = {
  displayName: "Opacity",
  propertyName: "opacity",
  inputType: "opacity" as any,
  defaultValue: 100,
  value: 75,
  onChange: vi.fn(),
};

describe("OpacityInputForm", () => {
  it("renders without crashing", () => {
    const { container } = render(<OpacityInputForm {...baseProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("shows the current value when not 100", () => {
    render(<OpacityInputForm {...baseProps} value={75} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("hides the value display when value is 100", () => {
    render(<OpacityInputForm {...baseProps} value={100} />);
    expect(screen.queryByText("100")).not.toBeInTheDocument();
  });

  it("opens popover on click", async () => {
    render(<OpacityInputForm {...baseProps} />);
    const trigger = document.getElementById("color-input")!;
    await userEvent.click(trigger);
    expect(screen.getByText("Opacity")).toBeInTheDocument();
  });
});
