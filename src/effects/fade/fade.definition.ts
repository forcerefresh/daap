import { fade, IFadeEffect } from "./fade.types";

export const fadeDefinition = {
  id: fade,
  name: "Fade",
  form: [],
};

export const fadeDefaults: IFadeEffect = {
  id: fade,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out", "event"],
  canBeCombined: true,
  outStartTime: {
    customValue: "0ms",
    inheritFrom: "inheritFromSlide",
  },
  // this effect has no configuration
};
