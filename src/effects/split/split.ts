import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { splitAnimation } from "./split.animation";
import { splitDefaults, splitDefinition } from "./split.definition";
import { SPLIT_ANIMATION } from "./split.types";

export const splitDef: IEffectExtensionDefinition = {
  effectId: SPLIT_ANIMATION,
  effectFunc: splitAnimation,
};

export const splitAppDef: IEffectExtensionAppDefinition = {
  effectId: SPLIT_ANIMATION,
  formDefaults: splitDefaults,
  formDefinition: splitDefinition,
};
