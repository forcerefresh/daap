import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "../../webslider-sdk/src/animations/animations-register";
import { fallingLeavesAnimation } from "./falling-leaves.animation";
import {
  fallingLeavesDefaults,
  fallingLeavesDefinition,
} from "./falling-leaves.definition";
import { FALLING_LEAVES_ANIMATION } from "./falling-leaves.types";

export const fallingLeavesDef: IAnimationExtensionDefinition = {
  animationId: FALLING_LEAVES_ANIMATION,
  animationFunc: fallingLeavesAnimation,
};

export const fallingLeavesAppDef: IAnimationExtensionAppDefinition = {
  animationId: FALLING_LEAVES_ANIMATION,
  formDefaults: fallingLeavesDefaults,
  formDefinition: fallingLeavesDefinition,
};
