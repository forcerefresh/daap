import {
  IBorderColorInput,
  ICheckboxInput,
  InputType,
  INumericTimelineInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { ISquareMaskEffect, SQUARE_MASK_ANIMATION } from "./square-mask.types";

export type ISquareMaskTuple = [
  IBorderColorInput<"borderColor">,
  INumericTimelineInput<"borderTop">,
  INumericTimelineInput<"borderBottom">,
  INumericTimelineInput<"borderLeft">,
  INumericTimelineInput<"borderRight">,
  ICheckboxInput<"hideMaskOnComplete">
];

export const squareMaskDefinition: IEffectDefinition<ISquareMaskTuple> = {
  id: SQUARE_MASK_ANIMATION,
  name: "Square Mask",
  form: [
    {
      displayName: "Border color",
      propertyName: "borderColor",
      inputType: InputType.BORDER_COLOR,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Top width",
      propertyName: "borderTop",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Bottom width",
      propertyName: "borderBottom",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Left width",
      propertyName: "borderLeft",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Right width",
      propertyName: "borderRight",
      inputType: InputType.NUMERIC_TIMELINE,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Hide on complete",
      helperText: "Hide mask element on complete",
      propertyName: "hideMaskOnComplete",
      inputType: InputType.CHECKBOX,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

const delayAndDuration = {
  hasTimelineProperties: false,
  delay: 0,
  duration: 1000,
};

export const squareMaskDefaults: ISquareMaskEffect = {
  id: SQUARE_MASK_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: false,
  // effect properties
  borderColor: {
    useCommonValue: true,
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
