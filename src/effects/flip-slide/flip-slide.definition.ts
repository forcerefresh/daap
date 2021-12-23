import { InputType } from "../../inputs/types";
import { flipSlide, IFlipSlideEffect } from "./flip-slide.types";

export const flipSlideDefinition = {
  id: flipSlide,
  name: "Flip Slide",
  form: [
    {
      displayName: "Flip",
      helperText: "Duration between items",
      propertyName: "durationBetweenItems",
      inputType: InputType.NUMBER,
    },
  ],
};

export const flipDefaults: IFlipSlideEffect = {
  id: flipSlide,
  hasDelay: true,
  hasDuration: false,
  hasOwnDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["slide"],
  durationBetweenItems: 3000,
};
