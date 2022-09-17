import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { KEN_BURNS_EFFECT } from "./ken-burns.types";
import { kenBurnsAnimation } from "./ken-burns.animation";
import { kenBurnsDefaults, kenBurnsDefinition } from "./ken-burns.definition";

export const kenBurnsDef: IEffectExtensionDefinition = {
  effectId: KEN_BURNS_EFFECT,
  effectFunc: kenBurnsAnimation,
};

export const kenBurnsAppDef: IEffectExtensionAppDefinition = {
  effectId: KEN_BURNS_EFFECT,
  formDefaults: kenBurnsDefaults,
  formDefinition: kenBurnsDefinition,
};
