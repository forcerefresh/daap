import { FADE_SLIDE_ANIMATION, IFadeSlideAnimation } from "./fade-slide.types";

export const fadeSlideDefinition = {
  id: FADE_SLIDE_ANIMATION,
  name: "Fade",
  form: [],
};

export const fadeSlideDefaults: IFadeSlideAnimation = {
  id: FADE_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["slide"],
  canBeCombined: true,
  library: "animejs",
  // this animation has no configuration
};
