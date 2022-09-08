import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { slideAnimation } from "./slide.animation";
import { slideDefaults, slideDefinition } from "./slide.definition";
import { SLIDE_ANIMATION } from "./slide.types";

export const slideDef: IEffectExtensionDefinition = {
  effectId: SLIDE_ANIMATION,
  effectFunc: slideAnimation,
};

export const slideAppDef: IEffectExtensionAppDefinition = {
  effectId: SLIDE_ANIMATION,
  formDefaults: slideDefaults,
  formDefinition: slideDefinition,
};
