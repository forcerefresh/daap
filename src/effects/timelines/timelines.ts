import { timelinesAnimation } from "./timelines.animation";
import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { timelinesDefaults, timelinesDefinition } from "./timelines.definition";
import { TIMELINES_EFFECT } from "./timelines.types";

export const timelinesDef: IEffectExtensionDefinition = {
  effectId: TIMELINES_EFFECT,
  effectFunc: timelinesAnimation,
};

export const timelinesAppDef: IEffectExtensionAppDefinition = {
  effectId: TIMELINES_EFFECT,
  formDefaults: timelinesDefaults,
  formDefinition: timelinesDefinition,
};
