import { INoneEffect } from "./none.types";

export const noneDefinition = {
  id: "none",
  name: "None",
  form: [],
};

export const noneDefaults: INoneEffect = {
  id: "none",
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "effect", "slide", "layer"],
  canBeCombined: true,
};
