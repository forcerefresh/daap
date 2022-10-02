import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { FADE_SLIDE_ANIMATION } from "./fade-slide.types";
import { fadeSlideAnimation } from "./fade-slide.animation";
import {
  fadeSlideDefaults,
  fadeSlideDefinition,
} from "./fade-slide.definition";

export const fadeSlideDef: IEffectExtensionDefinition = {
  effectId: FADE_SLIDE_ANIMATION,
  effectFunc: fadeSlideAnimation,
};

export const fadeSlideAppDef: IEffectExtensionAppDefinition = {
  effectId: FADE_SLIDE_ANIMATION,
  formDefaults: fadeSlideDefaults,
  formDefinition: fadeSlideDefinition,
};
