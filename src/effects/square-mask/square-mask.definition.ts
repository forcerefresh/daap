import { InputType } from "../../inputs/types";
import { ISquareMaskEffect, squareMask } from "./square-mask.types";

export const squareMaskDefinition = {
  id: squareMask,
  name: "Square Mask",
  form: [
    {
      displayName: "Border color",
      helperText: null,
      propertyName: "borderColor",
      inputType: InputType.BORDER_COLOR,
    },
    {
      displayName: "Bottom width",
      helperText: null,
      propertyName: "borderBottom",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Top width",
      helperText: null,
      propertyName: "borderTop",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Left width",
      helperText: null,
      propertyName: "borderLeft",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Right width",
      helperText: null,
      propertyName: "borderRight",
      inputType: InputType.NUMERIC_TIMELINE,
    },
    {
      displayName: "Hide on complete",
      helperText: "Hide mask element on complete",
      propertyName: "hideMaskOnComplete",
      inputType: InputType.CHECKBOX,
    },
  ],
};

const delayAndDuration = {
  hasTimelineProperties: false,
  delay: 0,
  duration: 1000,
};

export const squareMaskDefaults: ISquareMaskEffect = {
  id: squareMask,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: false,
  // effect properties
  borderColor: {
    useDifferentValues: false,
    borderColor: { r: 255, g: 255, b: 255, a: 1 },
    topBorderColor: { r: 255, g: 255, b: 255, a: 1 },
    bottomBorderColor: { r: 255, g: 255, b: 255, a: 1 },
    leftBorderColor: { r: 255, g: 255, b: 255, a: 1 },
    rightBorderColor: { r: 255, g: 255, b: 255, a: 1 },
  },
  borderBottom: { value: 0, ...delayAndDuration },
  borderLeft: { value: 0, ...delayAndDuration },
  borderRight: { value: 0, ...delayAndDuration },
  borderTop: { value: 0, ...delayAndDuration },
  hideMaskOnComplete: false,
};
