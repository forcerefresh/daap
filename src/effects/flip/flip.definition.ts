import { flip, IFlipEffect } from "./flip.types";

export const flipDefinition = {
  id: flip,
  name: "Flip",
  form: [],
};

export const flipDefaults: IFlipEffect = {
  id: flip,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
};
