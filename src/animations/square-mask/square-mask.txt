import {} from "webslider-sdk/lib/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { SQUARE_MASK_ANIMATION } from "./square-mask.types";
import {
  squareMaskDefaults,
  squareMaskDefinition,
} from "./square-mask.definition";
import { squareMaskAnimation } from "./square-mask.animation";

export const squareMaskDef: IAnimationExtensionDefinition = {
  animationId: SQUARE_MASK_ANIMATION,
  animationFunc: squareMaskAnimation,
};

export const squareMaskAppDef: IAnimationExtensionAppDefinition = {
  animationId: SQUARE_MASK_ANIMATION,
  formDefaults: squareMaskDefaults,
  formDefinition: squareMaskDefinition,
};
