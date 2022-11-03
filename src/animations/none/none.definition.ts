import { INoneAnimation } from "./none.types";

export const noneDefinition = {
  id: "none",
  name: "None",
  form: [],
};

export const noneDefaults: INoneAnimation = {
  id: "none",
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "animation", "slide", "layer"],
  canBeCombined: true,
};
