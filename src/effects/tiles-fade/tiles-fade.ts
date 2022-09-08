import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import {
  tilesFadeDefaults,
  tilesFadeDefinition,
} from "./tiles-fade.definition";
import { tilesFadeAnimation } from "./tiles-fade.animation";
import { TILES_FADE_ANIMATION } from "./tiles-fade.types";

export const tilesFadeDef: IEffectExtensionDefinition = {
  effectId: TILES_FADE_ANIMATION,
  effectFunc: tilesFadeAnimation,
};

export const tilesFadeAppDef: IEffectExtensionAppDefinition = {
  effectId: TILES_FADE_ANIMATION,
  formDefaults: tilesFadeDefaults,
  formDefinition: tilesFadeDefinition,
};
