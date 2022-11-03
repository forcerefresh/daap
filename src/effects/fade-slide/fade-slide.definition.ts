import { FADE_SLIDE_ANIMATION, IFadeSlideEffect } from "./fade-slide.types";

export const fadeSlideDefinition = {
  id: FADE_SLIDE_ANIMATION,
  name: "Fade",
  form: [],
};

export const fadeSlideDefaults: IFadeSlideEffect = {
  id: FADE_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["slide"],
  canBeCombined: true,
  library: "animejs",
  // this effect has no configuration
};
