import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { trianglifyAnimation } from "./trianglify.animation";
import {
  trianglifyDefaults,
  trianglifyDefinition,
} from "./trianglify.definition";
import { TRIANGLIFY_ANIMATION } from "./trianglify.types";

export const trianglifyDef: IAnimationExtensionDefinition = {
  animationId: TRIANGLIFY_ANIMATION,
  animationFunc: trianglifyAnimation,
};

export const trianglifyAppDef: IAnimationExtensionAppDefinition = {
  animationId: TRIANGLIFY_ANIMATION,
  formDefaults: trianglifyDefaults,
  formDefinition: trianglifyDefinition,
};
