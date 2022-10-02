import { FADE_SLIDE_ANIMATION, IFadeSlideEffect } from "./fade-slide.types";

export const fadeSlideDefinition = {
  id: FADE_SLIDE_ANIMATION,
  name: "Fade Slide",
  form: [],
};

export const fadeSlideDefaults: IFadeSlideEffect = {
  id: FADE_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["slide"],
  canBeCombined: true,
  // this effect has no configuration
};
