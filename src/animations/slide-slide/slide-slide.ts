import {} from "webslider-sdk/lib/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { SLIDE_SLIDE_ANIMATION } from "./slide-slide.types";
import {
  slideSlideDefaults,
  slideSlideDefinition,
} from "./slide-slide.definition";
import { slideSlideAnimation } from "./slide-slide.animation";

export const slideSlideDef: IAnimationExtensionDefinition = {
  animationId: SLIDE_SLIDE_ANIMATION,
  animationFunc: slideSlideAnimation,
};

export const slideSlideAppDef: IAnimationExtensionAppDefinition = {
  animationId: SLIDE_SLIDE_ANIMATION,
  formDefaults: slideSlideDefaults,
  formDefinition: slideSlideDefinition,
};
