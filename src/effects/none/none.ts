import { Easings, IEffectBase } from "../types";

interface INoneEffect extends IEffectBase {}

export const noneDefaults: INoneEffect = {
  id: "none",
  hasDelay: false,
  hasDuration: false,
  hasEasing: false,
  easing: Easings.None,
  customEasing: null,
};

export const noneDefinition = {
  id: "none",
  name: "None",
  form: [],
};
