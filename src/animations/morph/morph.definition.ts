import { MORPH_ANIMATION, IMorphAnimation } from "./morph.types";

export const morphDefinition = {
  id: MORPH_ANIMATION,
  name: "Morph",
  form: [],
};

export const morphDefaults: IMorphAnimation = {
  id: MORPH_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out"],
  canBeCombined: false,
};
