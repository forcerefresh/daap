import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RichTextAreaInputForm } from "./rich-textarea-input";

vi.mock("react-rte", () => {
  const RTE = ({ value, onChange, toolbarConfig, className }: any) => (
    <div data-testid="rte" />
  );
  RTE.createEmptyValue = () => ({ toString: () => "" });
  RTE.createValueFromString = (v: string) => ({ toString: () => v });
  return { default: RTE };
});
vi.mock("lodash-es", async () => {
  const actual = await vi.importActual("lodash-es");
  const debounceFn = (fn: any) => {
    const d = (...args: any[]) => fn(...args);
    d.flush = () => {};
    d.cancel = () => {};
    return d;
  };
  return { ...(actual as any), debounce: debounceFn };
});

const baseProps = {
  displayName: "Content",
  propertyName: "content",
  inputType: "rich-textarea" as any,
  value: "<p>hello</p>",
  defaultValue: "",
  onInput: vi.fn(),
};

describe("RichTextAreaInputForm", () => {
  it("renders the displayName label", () => {
    render(<RichTextAreaInputForm {...baseProps} />);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders the rich text editor", () => {
    render(<RichTextAreaInputForm {...baseProps} />);
    expect(screen.getByTestId("rte")).toBeInTheDocument();
  });
});
