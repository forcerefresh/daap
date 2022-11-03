import {} from "../../webslider-sdk/src/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "../../webslider-sdk/src/animations/animations-register";
import { FADE_SLIDE_ANIMATION } from "./fade-slide.types";
import { fadeSlideAnimation } from "./fade-slide.animation";
import {
  fadeSlideDefaults,
  fadeSlideDefinition,
} from "./fade-slide.definition";

export const fadeSlideDef: IAnimationExtensionDefinition = {
  animationId: FADE_SLIDE_ANIMATION,
  animationFunc: fadeSlideAnimation,
};

export const fadeSlideAppDef: IAnimationExtensionAppDefinition = {
  animationId: FADE_SLIDE_ANIMATION,
  formDefaults: fadeSlideDefaults,
  formDefinition: fadeSlideDefinition,
};
