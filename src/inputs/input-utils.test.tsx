import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetInputForm = vi.fn(() => null);
vi.mock("./input-factory", () => ({
  getInputForm: (...args: any[]) => mockGetInputForm(...args),
}));

import {
  getNumericFiled,
  getUnitNumericFiled,
  getColorField,
  getLinearGradientField,
  getColorArrayField,
  getSelectField,
  getTagsField,
  getSelectSlider,
  getCheckboxField,
  getTextArea,
  getTextField,
  getPasswordField,
  getButtonGroupField,
  getImageField,
  getUnderFieldText,
  getFontFamilyField,
  getInheritTimeField,
  getCoverLayoutField,
  getGridLayoutField,
  getAbsoluteLayoutField,
  getSizeLayoutField,
  getSizeUnitLayoutField,
  getP1P2LayoutField,
  getSizePosLayoutField,
  getSnapLayoutField,
  getFitLayoutField,
  getInsetLayoutField,
} from "./input-utils";
import { InputType } from "webslider-sdk/lib/inputs/i-inputs";

beforeEach(() => {
  mockGetInputForm.mockClear();
});

describe("getNumericFiled", () => {
  it("calls getInputForm with InputType.NUMBER", () => {
    getNumericFiled("Count", 5, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.NUMBER,
      expect.objectContaining({ displayName: "Count", value: 5 }),
      expect.any(Function),
      expect.any(Function)
    );
  });
});

describe("getUnitNumericFiled", () => {
  it("calls getInputForm with InputType.UNITS_NUMBER", () => {
    getUnitNumericFiled("Width", 100, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.UNITS_NUMBER,
      expect.objectContaining({ displayName: "Width", value: 100 }),
      expect.any(Function)
    );
  });
});

describe("getColorField", () => {
  it("calls getInputForm with InputType.COLOR", () => {
    getColorField("Fill", { r: 0, g: 0, b: 0 }, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.COLOR,
      expect.objectContaining({ displayName: "Fill" }),
      expect.any(Function),
      undefined,
      undefined,
      undefined
    );
  });
});

describe("getLinearGradientField", () => {
  it("calls getInputForm with InputType.LINEAR_GRADIENT", () => {
    getLinearGradientField("Gradient", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.LINEAR_GRADIENT,
      expect.objectContaining({ displayName: "Gradient" }),
      expect.any(Function),
      undefined,
      undefined,
      undefined
    );
  });
});

describe("getColorArrayField", () => {
  it("calls getInputForm with InputType.COLOR_ARRAY", () => {
    getColorArrayField("Colors", [], vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.COLOR_ARRAY,
      expect.objectContaining({ displayName: "Colors" }),
      expect.any(Function)
    );
  });
});

describe("getSelectField", () => {
  it("calls getInputForm with InputType.SELECT", () => {
    const options = [{ value: "a", label: "A" }];
    getSelectField("Mode", "a", options, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.SELECT,
      expect.objectContaining({ displayName: "Mode", value: "a", options }),
      expect.any(Function)
    );
  });
});

describe("getTagsField", () => {
  it("calls getInputForm with InputType.TAGS", () => {
    getTagsField("Tags", [], vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.TAGS,
      expect.objectContaining({ displayName: "Tags" }),
      expect.any(Function)
    );
  });
});

describe("getSelectSlider", () => {
  it("calls getInputForm with InputType.SLIDER_INPUT", () => {
    const inputProps = {
      min: 0,
      max: 100,
      suffix: "%",
      stepSize: 1,
      labelStepSize: 10,
      trackFill: true,
    };
    getSelectSlider("Opacity", 50, inputProps, vi.fn(), vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.SLIDER_INPUT,
      expect.objectContaining({ displayName: "Opacity", value: 50 }),
      expect.any(Function),
      undefined,
      undefined,
      expect.any(Function)
    );
  });
});

describe("getCheckboxField", () => {
  it("calls getInputForm with InputType.CHECKBOX", () => {
    getCheckboxField("Enabled", true, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.CHECKBOX,
      expect.objectContaining({ displayName: "Enabled", value: true }),
      expect.any(Function)
    );
  });
});

describe("getTextArea", () => {
  it("calls getInputForm with InputType.TEXTAREA", () => {
    getTextArea("Content", "hello", vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.TEXTAREA,
      expect.objectContaining({ displayName: "Content", value: "hello" }),
      expect.any(Function)
    );
  });
});

describe("getTextField", () => {
  it("calls getInputForm with InputType.TEXT", () => {
    getTextField("Name", "foo", vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.TEXT,
      expect.objectContaining({ displayName: "Name", value: "foo" }),
      expect.any(Function)
    );
  });
});

describe("getPasswordField", () => {
  it("calls getInputForm with InputType.PASSWORD", () => {
    getPasswordField("Secret", "", vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.PASSWORD,
      expect.objectContaining({ displayName: "Secret" }),
      expect.any(Function)
    );
  });
});

describe("getButtonGroupField", () => {
  it("calls getInputForm with InputType.BUTTON_GROUP_INPUT", () => {
    const options = [{ value: "left", label: "Left" }];
    getButtonGroupField("Align", "left", vi.fn(), options);
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.BUTTON_GROUP_INPUT,
      expect.objectContaining({ displayName: "Align", value: "left", options }),
      expect.any(Function)
    );
  });
});

describe("getImageField", () => {
  it("calls getInputForm with InputType.IMAGE", () => {
    getImageField("Photo", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.IMAGE,
      expect.objectContaining({ displayName: "Photo" }),
      expect.any(Function)
    );
  });
});

describe("getFontFamilyField", () => {
  it("calls getInputForm with InputType.FONT_SELECT", () => {
    getFontFamilyField("Font", "Roboto", vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.FONT_SELECT,
      expect.objectContaining({ displayName: "Font", value: "Roboto" }),
      expect.any(Function)
    );
  });
});

describe("getInheritTimeField", () => {
  it("calls getInputForm with InputType.INHERIT_TIME", () => {
    getInheritTimeField("Duration", { value: "custom", time: 500 }, [], vi.fn(), null);
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.INHERIT_TIME,
      expect.objectContaining({ displayName: "Duration" }),
      expect.any(Function)
    );
  });
});

describe("getCoverLayoutField", () => {
  it("calls getInputForm with InputType.COVER_LAYOUT", () => {
    getCoverLayoutField("Cover", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.COVER_LAYOUT,
      expect.objectContaining({ displayName: "Cover" }),
      expect.any(Function)
    );
  });
});

describe("getGridLayoutField", () => {
  it("calls getInputForm with InputType.GRID_LAYOUT", () => {
    getGridLayoutField("Grid", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.GRID_LAYOUT,
      expect.objectContaining({ displayName: "Grid" }),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ breakpoints: expect.any(Object) })
    );
  });
});

describe("getAbsoluteLayoutField", () => {
  it("calls getInputForm with InputType.ABSOLUTE_LAYOUT", () => {
    getAbsoluteLayoutField("Position", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.ABSOLUTE_LAYOUT,
      expect.objectContaining({ displayName: "Position" }),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ breakpoints: expect.any(Object) })
    );
  });
});

describe("getSizeLayoutField", () => {
  it("calls getInputForm with InputType.SIZE", () => {
    getSizeLayoutField("Size", { w: 100, h: 50 }, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.SIZE,
      expect.objectContaining({ displayName: "Size" }),
      expect.any(Function)
    );
  });
});

describe("getSizeUnitLayoutField", () => {
  it("calls getInputForm with InputType.SIZE_UNIT", () => {
    getSizeUnitLayoutField("Size", { w: 100 }, vi.fn(), [] as any);
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.SIZE_UNIT,
      expect.objectContaining({ displayName: "Size" }),
      expect.any(Function)
    );
  });
});

describe("getP1P2LayoutField", () => {
  it("calls getInputForm with InputType.P1_P2", () => {
    getP1P2LayoutField("Points", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.P1_P2,
      expect.objectContaining({ displayName: "Points" }),
      expect.any(Function)
    );
  });
});

describe("getSizePosLayoutField", () => {
  it("calls getInputForm with InputType.SIZE_POS", () => {
    getSizePosLayoutField("SizePos", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.SIZE_POS,
      expect.objectContaining({ displayName: "SizePos" }),
      expect.any(Function)
    );
  });
});

describe("getSnapLayoutField", () => {
  it("calls getInputForm with InputType.SNAP", () => {
    getSnapLayoutField("Snap", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.SNAP,
      expect.objectContaining({ displayName: "Snap" }),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ breakpoints: expect.any(Object) })
    );
  });
});

describe("getFitLayoutField", () => {
  it("calls getInputForm with InputType.FIT", () => {
    getFitLayoutField("Fit", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.FIT,
      expect.objectContaining({ displayName: "Fit" }),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ breakpoints: expect.any(Object) })
    );
  });
});

describe("getInsetLayoutField", () => {
  it("calls getInputForm with InputType.INSET", () => {
    getInsetLayoutField("Inset", {}, vi.fn());
    expect(mockGetInputForm).toHaveBeenCalledWith(
      InputType.INSET,
      expect.objectContaining({ displayName: "Inset" }),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ breakpoints: expect.any(Object) })
    );
  });
});

describe("getUnderFieldText", () => {
  it("returns undefined when no helperText or externalError", () => {
    expect(getUnderFieldText()).toBeUndefined();
  });

  it("renders helperText when provided", () => {
    const el = getUnderFieldText("hint text");
    render(<>{el}</>);
    expect(screen.getByText("hint text")).toBeInTheDocument();
  });

  it("renders externalError with Ooops prefix", () => {
    const el = getUnderFieldText(undefined, "something failed");
    render(<>{el}</>);
    expect(screen.getByText(/Ooops/)).toBeInTheDocument();
    expect(screen.getByText(/something failed/)).toBeInTheDocument();
  });

  it("renders both helperText and externalError", () => {
    const el = getUnderFieldText("hint", "error");
    render(<>{el}</>);
    expect(screen.getByText("hint")).toBeInTheDocument();
    expect(screen.getByText(/error/)).toBeInTheDocument();
  });
});
