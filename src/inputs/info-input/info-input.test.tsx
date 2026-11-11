import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InfoInputForm } from "./info-input";

const baseProps = {
  displayName: "Version",
  inputType: "info" as any,
  defaultValue: "",
};

describe("InfoInputForm", () => {
  it("renders the displayName", () => {
    render(<InfoInputForm {...baseProps} />);
    expect(screen.getByText("Version")).toBeInTheDocument();
  });

  it("renders helperText when provided", () => {
    render(<InfoInputForm {...baseProps} helperText="Read only field" />);
    expect(screen.getByText("Read only field")).toBeInTheDocument();
  });

  it("renders without helperText when not provided", () => {
    const { container } = render(<InfoInputForm {...baseProps} />);
    expect(container.querySelector(".bp5-form-helper-text")).toBeNull();
  });
});
