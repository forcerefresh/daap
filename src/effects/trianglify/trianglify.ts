import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { trianglifyAnimation } from "./trianglify.animation";
import {
  trianglifyDefaults,
  trianlifyDefinition,
} from "./trianglify.definition";
import { TRIANGLIFY_ANIMATION } from "./trianglify.types";

export const trianglifyDef: IEffectExtensionDefinition = {
  effectId: TRIANGLIFY_ANIMATION,
  effectFunc: trianglifyAnimation,
};

export const trianglifyAppDef: IEffectExtensionAppDefinition = {
  effectId: TRIANGLIFY_ANIMATION,
  formDefaults: trianglifyDefaults,
  formDefinition: trianlifyDefinition,
};
