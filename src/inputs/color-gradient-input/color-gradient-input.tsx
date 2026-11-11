import { FormGroup } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
import {
  getButtonGroupField,
  getColorField,
  getLinearGradientField,
} from "../input-utils";
import {
  IColorGradientInput,
  ILinearGradientValue,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { RGBColor } from "react-color";

export const ColorGradientInputForm: React.FC<
  IColorGradientInput & IUpdateInput
> = (props) => {
  const {
    displayName,
    helperText,
    value,
    onChange = noop,
    onPreview,
  } = props;

  const type = useMemo(() => {
    if ((value as ILinearGradientValue)?.points) {
      return "gradient";
    }

    return "solid";
  }, [value]);

  const [prevColor, setPrevColor] = useState<RGBColor | undefined>();
  const [prevLinearGradient, setPrevLinearGradient] = useState<
    ILinearGradientValue | undefined
  >();

  const updatePrevState = useCallback(() => {
    if (isRGBColor(value)) {
      setPrevColor(value as RGBColor);
    }
    if (isLinearGradient(value)) {
      setPrevLinearGradient(value as ILinearGradientValue);
    }
  }, [value, setPrevColor, setPrevLinearGradient]);

  return (
    <FormGroup label={displayName} inline helperText={helperText}>
      {getButtonGroupField(
        "",
        type,
        (val) => {
          updatePrevState();

          if (val === "solid") {
            const colorValue = prevColor ?? pickColorFromValue(value);
            onChange(colorValue);
          }
          if (val === "gradient") {
            const colorValue =
              prevLinearGradient ?? pickGradientFromValue(value);
            onChange(colorValue);
          }
        },
        [
          { label: "Solid", value: "solid" },
          { label: "Gradient", value: "gradient" },
        ]
      )}
      {type === "solid" &&
        getColorField(
          "",
          value,
          (val) => {
            onChange(val);
          },
          "",
          {},
          onPreview
        )}
      {type === "gradient" &&
        getLinearGradientField(
          "",
          value,
          (val) => {
            onChange(val);
          },
          undefined,
          undefined,
          onPreview
        )}
    </FormGroup>
  );
};

function pickColorFromValue(
  value: RGBColor | ILinearGradientValue | undefined
): RGBColor {
  if (typeof (value as RGBColor)?.r !== "undefined") {
    return value as RGBColor;
  }

  if ((value as ILinearGradientValue)?.points) {
    return (value as ILinearGradientValue)?.points[0].color as RGBColor;
  }

  return { r: 255, g: 255, b: 255, a: 1 };
}

function pickGradientFromValue(
  value: RGBColor | ILinearGradientValue | undefined
): ILinearGradientValue {
  if (typeof (value as RGBColor)?.r !== "undefined") {
    return {
      points: [
        { color: { ...(value as RGBColor) }, stop: 0 },
        { color: { r: 255, g: 255, b: 255, a: 1 }, stop: 100 },
      ],
      angle: 0,
    };
  }

  if ((value as ILinearGradientValue)?.points) {
    return value as ILinearGradientValue;
  }

  return {
    points: [
      { color: { r: 255, g: 255, b: 255, a: 1 }, stop: 0 },
      { color: { r: 0, g: 0, b: 0, a: 1 }, stop: 100 },
    ],
    angle: 0,
  };
}

export function isRGBColor(value: RGBColor | ILinearGradientValue | undefined) {
  return value && "r" in value && "g" in value && "b" in value;
}
export function isLinearGradient(
  value: RGBColor | ILinearGradientValue | undefined
) {
  return value && "points" in value && "angle" in value;
}
