import {
  InputType,
  INumberInput,
  ISelectInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { ISlideSlideEffect, SLIDE_SLIDE_ANIMATION } from "./slide-slide.types";

export type ISlideSlideTuple = [ISelectInput<"from">, INumberInput<"distance">];

export const slideSlideDefinition: IEffectDefinition<ISlideSlideTuple> = {
  id: SLIDE_SLIDE_ANIMATION,
  name: "Slide",
  form: [
    {
      displayName: "Direction",
      propertyName: "from",
      inputType: InputType.SELECT,
      value: {} as any,
      defaultValue: {} as any,
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" },
      ],
    },
    {
      displayName: "Distance",
      propertyName: "distance",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const slideSlideDefaults: ISlideSlideEffect = {
  id: SLIDE_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["slide"],
  canBeCombined: true,
  library: "animejs",
  // this effect has no configuration
  distance: 100,
  from: "right",
};
