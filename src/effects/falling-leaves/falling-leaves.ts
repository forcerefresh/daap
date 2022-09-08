import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { fallingLeavesAnimation } from "./falling-leaves.animation";
import {
  fallingLeavesDefaults,
  fallingLeavesDefinition,
} from "./falling-leaves.definition";
import { FALLING_LEAVES_ANIMATION } from "./falling-leaves.types";

export const fallingLeavesDef: IEffectExtensionDefinition = {
  effectId: FALLING_LEAVES_ANIMATION,
  effectFunc: fallingLeavesAnimation,
};

export const fallingLeavesAppDef: IEffectExtensionAppDefinition = {
  effectId: FALLING_LEAVES_ANIMATION,
  formDefaults: fallingLeavesDefaults,
  formDefinition: fallingLeavesDefinition,
};
