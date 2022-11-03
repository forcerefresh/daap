import {} from "../../webslider-sdk/src/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "../../webslider-sdk/src/animations/animations-register";
import { OVERLAP_ANIMATION } from "./overlap.types";
import { overlapAnimation } from "./overlap.animation";
import { overlapDefaults, overlapDefinition } from "./overlap.definition";

export const overlapDef: IAnimationExtensionDefinition = {
  animationId: OVERLAP_ANIMATION,
  animationFunc: overlapAnimation,
};

export const overlapAppDef: IAnimationExtensionAppDefinition = {
  animationId: OVERLAP_ANIMATION,
  formDefaults: overlapDefaults,
  formDefinition: overlapDefinition,
};
