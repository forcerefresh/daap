import {
  IEffectExtensionAppDefinition,
  IEffectExtensionDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { parallaxAnimation } from "./parallax.animation";
import { parallaxDefaults, parallaxDefinition } from "./parallax.definition";
import { PARALLAX_ANIMATION } from "./parallax.types";

export const parallaxDef: IEffectExtensionDefinition = {
  effectId: PARALLAX_ANIMATION,
  effectFunc: parallaxAnimation,
};

export const parallaxAppDef: IEffectExtensionAppDefinition = {
  effectId: PARALLAX_ANIMATION,
  formDefaults: parallaxDefaults,
  formDefinition: parallaxDefinition,
};
