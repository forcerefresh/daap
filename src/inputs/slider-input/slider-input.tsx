import React, { useCallback, useEffect, useRef, useState } from "react";
import { ISliderInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { FormGroup, Slider } from "@blueprintjs/core";
import css from "./slider-input.module.scss";
import classnames from "classnames";
import { debounce, throttle } from "lodash-es";
import { createInputLabel } from "../input-helpers";

export const SliderInputForm: React.FC<ISliderInput & IUpdateInput> = (
  props
) => {
  const {
    displayName,
    propertyName,
    helperText,
    value: valueFromProps,
    onChange,
    onPreview = () => undefined,
    inputProps = {},
  } = props;

  // NOTE:
  const value =
    typeof valueFromProps === "string"
      ? parseFloat(valueFromProps)
      : valueFromProps;

  const {
    trackFill = false,
    thumbPosition = "bottom",
    suffix = "",
    stepSize = 1,
    min = 0,
    max = 100,
    labelStepSize = 2,
    hideLabels = false,
  } = inputProps;

  const onPreviewRef = useRef(onPreview);
  onPreviewRef.current = onPreview;
  const onPreviewThrottle = throttle((v: any) => {
    onPreviewRef.current?.(v);
  }, 100);

  const [localValue, setLocalValue] = useState(value);
  const latestValueRef = useRef(value);

  useEffect(() => {
    if (value !== latestValueRef.current) setLocalValue(value);
  }, [localValue, value]);

  const labelValue = (val: number) => {
    return `${Math.round(val)}${suffix}`;
  };

  return (
    <FormGroup
      className={classnames(css.main, { [css.showLabels]: !hideLabels })}
      label={createInputLabel(displayName, propertyName)}
      helperText={!!helperText && helperText}
      inline
    >
      <Slider
        className={classnames(css.slider, {
          [css.thumbPositionTop]: thumbPosition === "top",
          [css.hideLabels]: hideLabels,
        })}
        min={min}
        max={max}
        stepSize={stepSize}
        labelStepSize={(max - min) / labelStepSize}
        labelRenderer={labelValue}
        onChange={(value) => {
          onPreviewThrottle(value);
          setLocalValue(value);
        }}
        onRelease={(value) => {
          onChange(value);
        }}
        value={localValue}
        showTrackFill={trackFill}
      />
    </FormGroup>
  );
};
