import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk2/lib/animations/animations-register";
import { splitAnimation } from "./split.animation";
import { splitDefaults, splitDefinition } from "./split.definition";
import { SPLIT_ANIMATION } from "./split.types";

export const splitDef: IAnimationExtensionDefinition = {
  animationId: SPLIT_ANIMATION,
  animationFunc: splitAnimation,
};

export const splitAppDef: IAnimationExtensionAppDefinition = {
  animationId: SPLIT_ANIMATION,
  formDefaults: splitDefaults,
  formDefinition: splitDefinition,
};
