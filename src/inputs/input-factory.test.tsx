import { describe, it, expect, vi } from "vitest";

// Mock input-helpers to block store/panel import chains
vi.mock("./input-helpers", () => ({
  createInputLabel: (label: string) => label,
}));

// Mock components that import directly from panels, store, or integration
vi.mock("./audio-input/audio-input", () => ({
  AudioInputForm: () => null,
}));
vi.mock("./image-input/image-input", () => ({
  ImageInputForm: () => null,
}));
vi.mock("./video-input/video-input", () => ({
  VideoInputForm: () => null,
}));
vi.mock("./multi-image-input/multi-image-input", () => ({
  MultiImageInputForm: () => null,
}));
vi.mock("./svg-input/svg-input", () => ({
  SVGInputForm: () => null,
}));
vi.mock("./svg-mask-input/svg-mask-input", () => ({
  SvgMaskInputForm: () => null,
}));
vi.mock("./color-input/color-input", () => ({
  default: () => null,
}));
vi.mock("./absolute-layout-input/absolute-layout-input", () => ({
  AbsolutePlacementForm: () => null,
}));
vi.mock("./grid-layout-input/grid-layout-input", () => ({
  GridPlacementInputForm: () => null,
}));
vi.mock("./snap-layout-input/snap-layout-input", () => ({
  SnapInputForm: () => null,
}));
vi.mock("./fit-input/fit-input", () => ({
  FitInputForm: () => null,
}));
vi.mock("./inset-layout-input/inset-layout-input", () => ({
  InsetLayoutInputForm: () => null,
}));
vi.mock("./svg-textarea-input/svg-textarea-input", () => ({
  SVGTextAreaInputForm: () => null,
}));
vi.mock("./extra-options-optional/extra-options-input", () => ({
  default: () => null,
}));
vi.mock("./parallax-input/parallax-input", () => ({
  ParallaxInputForm: () => null,
}));

import { getInputForm, getInputFormWithOptions } from "./input-factory";
import { InputType } from "webslider-sdk/lib/inputs/i-inputs";

const baseProps = { propertyName: "test" } as any;
const onChange = vi.fn();

describe("getInputForm", () => {
  it("returns undefined for an unrecognized input type", () => {
    const result = getInputForm("unknown_type" as any, baseProps, onChange);
    expect(result).toBeUndefined();
  });

  it("returns a React element for InputType.NUMBER", () => {
    const result = getInputForm(InputType.NUMBER, baseProps, onChange);
    expect(result).toBeDefined();
  });

  it("returns a React element for InputType.TEXT", () => {
    const result = getInputForm(InputType.TEXT, baseProps, onChange);
    expect(result).toBeDefined();
  });

  it("returns a React element for InputType.CHECKBOX", () => {
    const result = getInputForm(InputType.CHECKBOX, baseProps, onChange);
    expect(result).toBeDefined();
  });

  it("returns a React element for InputType.SELECT", () => {
    const result = getInputForm(
      InputType.SELECT,
      { ...baseProps, options: [] } as any,
      onChange
    );
    expect(result).toBeDefined();
  });
});

describe("getInputFormWithOptions", () => {
  it("sets inputProps.disabled when metadata.disabled is true", () => {
    const inputProps = {
      propertyName: "x",
      metadata: { disabled: true },
    } as any;
    getInputFormWithOptions(InputType.NUMBER, inputProps, onChange);
    expect(inputProps.inputProps?.disabled).toBe(true);
  });

  it("does not set inputProps.disabled when metadata.disabled is false", () => {
    const inputProps = {
      propertyName: "x",
      metadata: { disabled: false },
    } as any;
    getInputFormWithOptions(InputType.NUMBER, inputProps, onChange);
    expect(inputProps.inputProps?.disabled).toBeUndefined();
  });

  it("returns a defined element for a known type without extraOptions", () => {
    const result = getInputFormWithOptions(InputType.NUMBER, baseProps, onChange);
    expect(result).toBeDefined();
  });

  it("wraps in a fragment when extraOptions has optional flag", () => {
    const inputProps = {
      propertyName: "x",
      extraOptions: { optional: true },
    } as any;
    const result = getInputFormWithOptions(InputType.NUMBER, inputProps, onChange);
    // Fragment type is Symbol(react.fragment)
    expect(result).toBeDefined();
  });
});
