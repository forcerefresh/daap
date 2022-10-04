import {
  InputType,
  INumberInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { FLIP_SLIDE_ANIMATION, IFlipSlideEffect } from "./flip-slide.types";

export type IFlipSlideTuple = [INumberInput<"durationBetweenItems">];

export const flipSlideDefinition: IEffectDefinition<IFlipSlideTuple> = {
  id: FLIP_SLIDE_ANIMATION,
  name: "Flip",
  form: [
    {
      displayName: "Flip",
      helperText: "Duration between items",
      propertyName: "durationBetweenItems",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const flipSlideDefaults: IFlipSlideEffect = {
  id: FLIP_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: false,
  hasOwnDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["slide"],
  canBeCombined: false,
  // effect properties
  durationBetweenItems: 3000,
};
