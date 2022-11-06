import {
  IAnimationExtensionAppDefinition,
  IAnimationExtensionDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { FLIP_SLIDE_ANIMATION } from "./flip-slide.types";
import { flipSlideAnimation } from "./flip-slide.animation";
import {
  flipSlideDefaults,
  flipSlideDefinition,
} from "./flip-slide.definition";

export const flipSlideDef: IAnimationExtensionDefinition = {
  animationId: FLIP_SLIDE_ANIMATION,
  animationFunc: flipSlideAnimation,
};

export const flipSlideAppDef: IAnimationExtensionAppDefinition = {
  animationId: FLIP_SLIDE_ANIMATION,
  formDefaults: flipSlideDefaults,
  formDefinition: flipSlideDefinition,
};
