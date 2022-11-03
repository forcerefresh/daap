import { transformAnimation } from "./transform.animation";
import {} from "../../webslider-sdk/src/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "../../webslider-sdk/src/animations/animations-register";
import { timelinesDefaults, timelinesDefinition } from "./transform.definition";
import { TRANSFORM_EFFECT } from "./transform.types";

export const timelinesDef: IAnimationExtensionDefinition = {
  animationId: TRANSFORM_EFFECT,
  animationFunc: transformAnimation,
};

export const timelinesAppDef: IAnimationExtensionAppDefinition = {
  animationId: TRANSFORM_EFFECT,
  formDefaults: timelinesDefaults,
  formDefinition: timelinesDefinition,
};
