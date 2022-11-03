import {
  InputType,
  INumberInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { FLIP_SLIDE_ANIMATION, IFlipSlideEffect } from "./flip-slide.types";

export type IFlipSlideTuple = [];

export const flipSlideDefinition: IEffectDefinition<IFlipSlideTuple> = {
  id: FLIP_SLIDE_ANIMATION,
  name: "Flip",
  form: [],
};

export const flipSlideDefaults: IFlipSlideEffect = {
  id: FLIP_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["slide"],
  canBeCombined: false,
  // effect properties
};
