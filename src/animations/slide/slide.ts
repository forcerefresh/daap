import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk2/lib/animations/animations-register";
import { slideAnimation } from "./slide.animation";
import { slideDefaults, slideDefinition } from "./slide.definition";
import { SLIDE_ANIMATION } from "./slide.types";

export const slideDef: IAnimationExtensionDefinition = {
  animationId: SLIDE_ANIMATION,
  animationFunc: slideAnimation,
};

export const slideAppDef: IAnimationExtensionAppDefinition = {
  animationId: SLIDE_ANIMATION,
  formDefaults: slideDefaults,
  formDefinition: slideDefinition,
};
