import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { textAnimation } from "./text.animation";
import { textDefaults, textDefinition } from "./text.definition";
import { TEXT_ANIMATION } from "./text.types";

export const textDef: IEffectExtensionDefinition = {
  effectId: TEXT_ANIMATION,
  effectFunc: textAnimation,
};

export const textAppDef: IEffectExtensionAppDefinition = {
  effectId: TEXT_ANIMATION,
  formDefaults: textDefaults,
  formDefinition: textDefinition,
};
