import { InputType } from "../../webslider-sdk/src/inputs/i-inputs";
import { canvasCopy, ICanvasCopyAnimation } from "./canvas-copy";

export const canvasCopyDefinition = {
  id: canvasCopy,
  name: "Canvas copy",
  form: [],
};

export const canvasCopyDefaults: ICanvasCopyAnimation = {
  id: canvasCopy,
  hasDelay: true,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out"],
  canBeCombined: false,
};
