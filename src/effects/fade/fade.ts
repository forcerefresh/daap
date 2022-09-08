import { fadeAnimation } from "./fade.animation";
import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { fadeDefaults, fadeDefinition } from "./fade.definition";
import { FADE_ANIMATION } from "./fade.types";

export const fadeDef: IEffectExtensionDefinition = {
  effectId: FADE_ANIMATION,
  effectFunc: fadeAnimation,
};

export const fadeAppDef: IEffectExtensionAppDefinition = {
  effectId: FADE_ANIMATION,
  formDefaults: fadeDefaults,
  formDefinition: fadeDefinition,
};
