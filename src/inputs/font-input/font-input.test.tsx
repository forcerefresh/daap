import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FontSelectInputForm } from "./font-input";

vi.mock("../../globals", () => ({
  getGlobals: () => ({
    getFonts: () => [
      { fontFamily: "Roboto", source: "google-fonts" },
      { fontFamily: "Open Sans", source: "google-fonts" },
    ],
    getMyFonts: () => [],
  }),
}));
vi.mock("../../utils/fonts/google-fonts", () => ({
  getGoogleVariantsNice: () => ["400", "700"],
}));

const baseProps = {
  displayName: "Font",
  propertyName: "font",
  inputType: "font-select" as any,
  value: { fontFamily: "Roboto", source: "google-fonts", weight: "400" } as any,
  defaultValue: { fontFamily: "Roboto", source: "google-fonts", weight: "400" } as any,
  onChange: vi.fn(),
};

describe("FontSelectInputForm", () => {
  it("renders the displayName label", () => {
    render(<FontSelectInputForm {...baseProps} />);
    expect(screen.getByText("Font")).toBeInTheDocument();
  });

  it("renders the font family select with Roboto as an option", () => {
    render(<FontSelectInputForm {...baseProps} />);
    expect(screen.getAllByRole("combobox")[0]).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Roboto" })).toBeInTheDocument();
  });

  it("renders the Weight label", () => {
    render(<FontSelectInputForm {...baseProps} />);
    expect(screen.getByText("Weight")).toBeInTheDocument();
  });

  it("calls onChange when weight changes", () => {
    const onChange = vi.fn();
    render(<FontSelectInputForm {...baseProps} onChange={onChange} />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "700" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ weight: "700" })
    );
  });
});
