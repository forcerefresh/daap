import { InputType } from "../../inputs/types";
import { dev, IDevEffect } from "./dev.types";

export const devDefinition = {
  id: dev,
  name: "Dev *",
  form: [
    {
      displayName: "Colors",
      helperText: "ccc",
      propertyName: "colors1",
      inputType: InputType.COLOR_ARRAY_PRESETS,
    },
  ],
};

export const devDefaults: IDevEffect = {
  id: dev,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out", "effect", "slide", "layer"],
  colors1: [{ r: 256, g: 256, b: 256, a: 1 }],
};
