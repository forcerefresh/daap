import {
  IEffectExtensionAppDefinition,
  IEffectExtensionDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { flipDefaults, flipDefinition } from "./flip.definition";
import { FLIP_ANIMATION } from "./flip.types";
import { flipAnimation } from "./flip.animation";

export const flipDef: IEffectExtensionDefinition = {
  effectId: FLIP_ANIMATION,
  effectFunc: flipAnimation,
};

export const flipAppDef: IEffectExtensionAppDefinition = {
  effectId: FLIP_ANIMATION,
  formDefaults: flipDefaults,
  formDefinition: flipDefinition,
};
