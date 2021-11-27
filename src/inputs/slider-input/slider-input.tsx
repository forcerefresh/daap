import React from "react";
import { ISliderInput, IUpdateInput } from "../types";
import { Slider } from "@blueprintjs/core";

export const SliderInputForm: React.FC<ISliderInput & IUpdateInput> = (
  props
) => {
  const { value, onChange, inputProperties } = props;

  console.log(value, "ppp");

  const updateValue = (val: any) => {
    onChange(val);
  };

  const labelValue = (val: number) => {
    return `${Math.round(val)}${inputProperties.sufix}`;
  };

  return (
    <div>
      <Slider
        min={inputProperties.min}
        max={inputProperties.max}
        stepSize={inputProperties.stepSize}
        labelStepSize={inputProperties.max / inputProperties.labelStepSize}
        labelRenderer={labelValue}
        onChange={updateValue}
        value={value}
        showTrackFill={inputProperties.trackFill}
      />
    </div>
  );
};
