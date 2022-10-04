import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { SLIDE_SLIDE_ANIMATION } from "./slide-slide.types";
import {
  slideSlideDefaults,
  slideSlideDefinition,
} from "./slide-slide.definition";
import { slideSlideAnimation } from "./slide-slide.animation";

export const slideSlideDef: IEffectExtensionDefinition = {
  effectId: SLIDE_SLIDE_ANIMATION,
  effectFunc: slideSlideAnimation,
};

export const slideSlideAppDef: IEffectExtensionAppDefinition = {
  effectId: SLIDE_SLIDE_ANIMATION,
  formDefaults: slideSlideDefaults,
  formDefinition: slideSlideDefinition,
};
