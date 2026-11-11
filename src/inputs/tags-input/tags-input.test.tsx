import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TagsInputForm, createTags } from "./tags-input";

vi.mock("../input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));

vi.mock("../input-utils", () => ({
  getUnderFieldText: () => undefined,
}));

const baseProps = {
  displayName: "Tags",
  propertyName: "tags",
  inputType: "tags" as any,
  defaultValue: [],
  value: ["design", "motion"],
  onChange: vi.fn(),
};

describe("TagsInputForm", () => {
  it("renders the label", () => {
    render(<TagsInputForm {...baseProps} />);
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("renders existing tags", () => {
    render(<TagsInputForm {...baseProps} />);
    expect(screen.getByText("design")).toBeInTheDocument();
    expect(screen.getByText("motion")).toBeInTheDocument();
  });
});

describe("createTags", () => {
  it("splits a single query into an array", () => {
    expect(createTags("alpha")).toEqual(["alpha"]);
  });

  it("splits a comma-separated query into multiple tags", () => {
    expect(createTags("alpha, beta, gamma")).toEqual(["alpha", "beta", "gamma"]);
  });

  it("returns empty string entry for empty query", () => {
    expect(createTags("")).toEqual([""]);
  });
});
