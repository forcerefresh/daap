import {
  IEffectExtensionAppDefinition,
  IEffectExtensionDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { FLIP_SLIDE_ANIMATION } from "./flip-slide.types";
import { flipSlideAnimation } from "./flip-slide.animation";
import {
  flipSlideDefaults,
  flipSlideDefinition,
} from "./flip-slide.definition";

export const flipSlideDef: IEffectExtensionDefinition = {
  effectId: FLIP_SLIDE_ANIMATION,
  effectFunc: flipSlideAnimation,
};

export const flipSlideAppDef: IEffectExtensionAppDefinition = {
  effectId: FLIP_SLIDE_ANIMATION,
  formDefaults: flipSlideDefaults,
  formDefinition: flipSlideDefinition,
};
