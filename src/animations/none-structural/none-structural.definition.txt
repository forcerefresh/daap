import {
  INoneStructuralAnimation,
  noneStructural,
} from "./none-structural.types";

export const noneStructuralDefinition = {
  id: noneStructural,
  name: "None",
  form: [],
};

export const noneStructuralDefaults: INoneStructuralAnimation = {
  id: noneStructural,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "animation", "slide", "layer"],
  canBeCombined: false,
};
