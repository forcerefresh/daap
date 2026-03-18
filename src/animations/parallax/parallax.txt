import {
  IAnimationExtensionAppDefinition,
  IAnimationExtensionDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { parallaxAnimation } from "./parallax.animation";
import { parallaxDefaults, parallaxDefinition } from "./parallax.definition";
import { PARALLAX_ANIMATION } from "./parallax.types";

export const parallaxDef: IAnimationExtensionDefinition = {
  animationId: PARALLAX_ANIMATION,
  animationFunc: parallaxAnimation,
};

export const parallaxAppDef: IAnimationExtensionAppDefinition = {
  animationId: PARALLAX_ANIMATION,
  formDefaults: parallaxDefaults,
  formDefinition: parallaxDefinition,
};
