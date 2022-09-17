import {} from "../../webslider-sdk/src/effects/i-effect-types";
import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { SQUARE_MASK_ANIMATION } from "./square-mask.types";
import {
  squareMaskDefaults,
  squareMaskDefinition,
} from "./square-mask.definition";
import { squareMaskAnimation } from "./square-mask.animation";

export const squareMaskDef: IEffectExtensionDefinition = {
  effectId: SQUARE_MASK_ANIMATION,
  effectFunc: squareMaskAnimation,
};

export const squareMaskAppDef: IEffectExtensionAppDefinition = {
  effectId: SQUARE_MASK_ANIMATION,
  formDefaults: squareMaskDefaults,
  formDefinition: squareMaskDefinition,
};
