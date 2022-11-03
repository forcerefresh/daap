import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "../../webslider-sdk/src/animations/animations-register";
import {
  tilesFadeDefaults,
  tilesFadeDefinition,
} from "./tiles-fade.definition";
import { tilesFadeAnimation } from "./tiles-fade.animation";
import { TILES_FADE_ANIMATION } from "./tiles-fade.types";

export const tilesFadeDef: IAnimationExtensionDefinition = {
  animationId: TILES_FADE_ANIMATION,
  animationFunc: tilesFadeAnimation,
};

export const tilesFadeAppDef: IAnimationExtensionAppDefinition = {
  animationId: TILES_FADE_ANIMATION,
  formDefaults: tilesFadeDefaults,
  formDefinition: tilesFadeDefinition,
};
