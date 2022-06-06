import React, { useCallback, useEffect, useState } from "react";
import {
  ISliderInput,
  IUpdateInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { FormGroup, Slider } from "@blueprintjs/core";
import css from "./slider-input.module.scss";
import classnames from "classnames";
import { debounce } from "lodash-es";

export const SliderInputForm: React.FC<ISliderInput & IUpdateInput> = (
  props
) => {
  const { displayName, helperText, value, onChange, inputProps = {} } = props;
  const {
    trackFill = false,
    thumbPosition = "bottom",
    sufix = "",
    stepSize = 1,
    min = 0,
    max = 100,
    labelStepSize = 2,
    hideLabels = false,
  } = inputProps;

  const [localValue, setLocalValue] = useState(value);
  useEffect(() => {
    if (value !== localValue) updateValue(localValue);
  }, [localValue]);

  const updateValue = useCallback(debounce(onChange, 100), [onChange]);

  useEffect(() => {
    return () => {
      updateValue.flush();
    };
  }, []);

  const labelValue = (val: number) => {
    return `${Math.round(val)}${sufix}`;
  };

  return (
    <FormGroup
      className={classnames(css.main, { [css.showLabels]: !hideLabels })}
      label={displayName}
      helperText={!!helperText && helperText}
      inline
    >
      <Slider
        className={classnames({
          [css.thumbPositionTop]: thumbPosition === "top",
          [css.hideLabels]: hideLabels,
        })}
        min={min}
        max={max}
        stepSize={stepSize}
        labelStepSize={(max - min) / labelStepSize}
        labelRenderer={labelValue}
        onChange={setLocalValue}
        value={localValue}
        showTrackFill={trackFill}
      />
    </FormGroup>
  );
};
