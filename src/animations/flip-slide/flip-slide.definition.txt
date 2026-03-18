import { InputType, INumberInput } from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationDefinition } from "webslider-sdk/lib/animations/i-animation-types";
import { FLIP_SLIDE_ANIMATION, IFlipSlideAnimation } from "./flip-slide.types";

export type IFlipSlideTuple = [];

export const flipSlideDefinition: IAnimationDefinition<IFlipSlideTuple> = {
  id: FLIP_SLIDE_ANIMATION,
  name: "Flip",
  form: [],
};

export const flipSlideDefaults: IFlipSlideAnimation = {
  id: FLIP_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["slide"],
  canBeCombined: false,
  // animation properties
};
