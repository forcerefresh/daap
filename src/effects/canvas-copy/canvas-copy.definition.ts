import { InputType } from "../../webslider-sdk/src/inputs/i-inputs";
import { canvasCopy, ICanvasCopyEffect } from "./canvas-copy";

export const canvasCopyDefinition = {
  id: canvasCopy,
  name: "Canvas copy",
  form: [],
};

export const canvasCopyDefaults: ICanvasCopyEffect = {
  id: canvasCopy,
  hasDelay: true,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: false,
};
