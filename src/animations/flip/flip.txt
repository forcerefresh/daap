import {
  IAnimationExtensionAppDefinition,
  IAnimationExtensionDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { flipDefaults, flipDefinition } from "./flip.definition";
import { FLIP_ANIMATION } from "./flip.types";
import { flipAnimation } from "./flip.animation";

export const flipDef: IAnimationExtensionDefinition = {
  animationId: FLIP_ANIMATION,
  animationFunc: flipAnimation,
};

export const flipAppDef: IAnimationExtensionAppDefinition = {
  animationId: FLIP_ANIMATION,
  formDefaults: flipDefaults,
  formDefinition: flipDefinition,
};
