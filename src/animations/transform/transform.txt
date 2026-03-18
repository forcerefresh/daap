import { transformAnimation } from "./transform.animation";
import {} from "webslider-sdk/lib/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { timelinesDefaults, timelinesDefinition } from "./transform.definition";
import { TRANSFORM_ANIMATION } from "./transform.types";

export const timelinesDef: IAnimationExtensionDefinition = {
  animationId: TRANSFORM_ANIMATION,
  animationFunc: transformAnimation,
};

export const timelinesAppDef: IAnimationExtensionAppDefinition = {
  animationId: TRANSFORM_ANIMATION,
  formDefaults: timelinesDefaults,
  formDefinition: timelinesDefinition,
};
