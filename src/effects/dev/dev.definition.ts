import { dev, IDevEffect } from "./dev.types";

export const devDefinition = {
  id: dev,
  name: "Dev *",
  form: [],
};

export const devDefaults: IDevEffect = {
  id: dev,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out", "effect", "slide", "layer"],
};
