import { fadeAnimation } from "./fade.animation";
import {} from "webslider-sdk2/lib/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk2/lib/animations/animations-register";
import { fadeDefaults, fadeDefinition } from "./fade.definition";
import { FADE_ANIMATION } from "./fade.types";

export const fadeDef: IAnimationExtensionDefinition = {
  animationId: FADE_ANIMATION,
  animationFunc: fadeAnimation,
};

export const fadeAppDef: IAnimationExtensionAppDefinition = {
  animationId: FADE_ANIMATION,
  formDefaults: fadeDefaults,
  formDefinition: fadeDefinition,
};
