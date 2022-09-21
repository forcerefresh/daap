import {
  getTypewriterAnimationDuration,
  typewriterAnimation,
} from "./typewriter.animation";
import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import {
  typewriterDefaults,
  typewriterDefinition,
} from "./typewriter.definition";
import { TYPEWRITER_ANIMATION } from "./typewriter.types";

export const typewriterDef: IEffectExtensionDefinition = {
  effectId: TYPEWRITER_ANIMATION,
  effectFunc: typewriterAnimation,
};

export const typewriterAppDef: IEffectExtensionAppDefinition = {
  effectId: TYPEWRITER_ANIMATION,
  formDefaults: typewriterDefaults,
  formDefinition: typewriterDefinition,
  getDuration: getTypewriterAnimationDuration,
};
