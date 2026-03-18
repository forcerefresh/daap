import { FADE_ANIMATION, IFadeAnimation } from "./fade.types";

export const fadeDefinition = {
  id: FADE_ANIMATION,
  name: "Fade",
  form: [],
};

export const fadeDefaults: IFadeAnimation = {
  id: FADE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "event"],
  supportLayers: true,
  canBeCombined: true,
  outStartTime: {
    customValue: "0ms",
    inheritFrom: "inheritFromSlide",
  },
  // this animation has no configuration
};
