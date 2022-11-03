import { INoneStructuralEffect, noneStructural } from "./none-structural.types";

export const noneStructuralDefinition = {
  id: noneStructural,
  name: "None",
  form: [],
};

export const noneStructuralDefaults: INoneStructuralEffect = {
  id: noneStructural,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "effect", "slide", "layer"],
  canBeCombined: false,
};
