import { InputType, INumberInput } from "../../inputs/types";
import { IEffectDefinition } from "../types";
import { flipSlide, IFlipSlideEffect } from "./flip-slide.types";

export type IFlipSlideTuple = [INumberInput<"durationBetweenItems">];

export const flipSlideDefinition: IEffectDefinition<IFlipSlideTuple> = {
  id: flipSlide,
  name: "Flip Slide",
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
  id: flipSlide,
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
