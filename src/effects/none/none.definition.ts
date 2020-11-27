import { INoneEffect } from "./none.types";
import { Easings } from "../types";

export const noneDefinition = {
  id: "none",
  name: "None",
  form: [],
};

export const noneDefaults: INoneEffect = {
  id: "none",
  hasDelay: false,
  hasDuration: false,
  hasEasing: false,
  easing: Easings.None,
  customEasing: null,
};
