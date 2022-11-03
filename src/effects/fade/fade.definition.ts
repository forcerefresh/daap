import { FADE_ANIMATION, IFadeEffect } from "./fade.types";

export const fadeDefinition = {
  id: FADE_ANIMATION,
  name: "Fade",
  form: [],
};

export const fadeDefaults: IFadeEffect = {
  id: FADE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "event"],
  canBeCombined: true,
  outStartTime: {
    customValue: "0ms",
    inheritFrom: "inheritFromSlide",
  },
  // this effect has no configuration
};
