import {
  InputType,
  INumberInput,
  ISelectInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { ISlideEffect, SLIDE_ANIMATION } from "./slide.types";

export type ISlideTuple = [ISelectInput<"from">, INumberInput<"distance">];

export const slideDefinition: IEffectDefinition<ISlideTuple> = {
  id: SLIDE_ANIMATION,
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

export const slideDefaults: ISlideEffect = {
  id: SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out", "event"],
  canBeCombined: true,
  // specific this effect
  distance: 100,
  from: "right",
};
