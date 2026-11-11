import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HTMLInputForm } from "./html-input";

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
  displayName: "HTML",
  propertyName: "html",
  inputType: "html" as any,
  value: { source: "<div>hello</div>" } as any,
  defaultValue: { source: "" } as any,
  onInput: vi.fn(),
};

describe("HTMLInputForm", () => {
  it("renders the displayName label", () => {
    render(<HTMLInputForm {...baseProps} />);
    expect(screen.getByText("HTML")).toBeInTheDocument();
  });

  it("renders textarea with current source value", () => {
    render(<HTMLInputForm {...baseProps} />);
    expect(screen.getByDisplayValue("<div>hello</div>")).toBeInTheDocument();
  });

  it("calls onInput when textarea changes", () => {
    const onInput = vi.fn();
    render(<HTMLInputForm {...baseProps} onInput={onInput} />);
    fireEvent.change(screen.getByDisplayValue("<div>hello</div>"), {
      target: { value: "<p>world</p>" },
    });
    expect(onInput).toHaveBeenCalledWith({ source: "<p>world</p>" });
  });
});
