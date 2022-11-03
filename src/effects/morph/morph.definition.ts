import { morph, IFadeEffect } from "./morph.types";

export const morphDefinition = {
  id: morph,
  name: "Morph",
  form: [],
};

export const morphDefaults: IFadeEffect = {
  id: morph,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out"],
  canBeCombined: false,
};
