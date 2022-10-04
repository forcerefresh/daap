import { transformAnimation } from "./transform.animation";
import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { timelinesDefaults, timelinesDefinition } from "./transform.definition";
import { TRANSFORM_EFFECT } from "./transform.types";

export const timelinesDef: IEffectExtensionDefinition = {
  effectId: TRANSFORM_EFFECT,
  effectFunc: transformAnimation,
};

export const timelinesAppDef: IEffectExtensionAppDefinition = {
  effectId: TRANSFORM_EFFECT,
  formDefaults: timelinesDefaults,
  formDefinition: timelinesDefinition,
};
