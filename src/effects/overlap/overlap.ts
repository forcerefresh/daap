import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { OVERLAP_ANIMATION } from "./overlap.types";
import { overlapAnimation } from "./overlap.animation";
import { overlapDefaults, overlapDefinition } from "./overlap.definition";

export const overlapDef: IEffectExtensionDefinition = {
  effectId: OVERLAP_ANIMATION,
  effectFunc: overlapAnimation,
};

export const overlapAppDef: IEffectExtensionAppDefinition = {
  effectId: OVERLAP_ANIMATION,
  formDefaults: overlapDefaults,
  formDefinition: overlapDefinition,
};
