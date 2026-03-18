import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { KEN_BURNS_ANIMATION } from "./ken-burns.types";
import { kenBurnsAnimation } from "./ken-burns.animation";
import { kenBurnsDefaults, kenBurnsDefinition } from "./ken-burns.definition";

export const kenBurnsDef: IAnimationExtensionDefinition = {
  animationId: KEN_BURNS_ANIMATION,
  animationFunc: kenBurnsAnimation,
};

export const kenBurnsAppDef: IAnimationExtensionAppDefinition = {
  animationId: KEN_BURNS_ANIMATION,
  formDefaults: kenBurnsDefaults,
  formDefinition: kenBurnsDefinition,
};
