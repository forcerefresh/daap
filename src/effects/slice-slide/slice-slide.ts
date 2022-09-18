import {
  IEffectExtensionAppDefinition,
  IEffectExtensionDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { sliceSlideAnimation } from "./slice-slide.animation";
import {
  sliceSlideDefaults,
  sliceSlideDefinition,
} from "./slice-slide.definition";
import { SLICE_SLIDE_ANIMATION } from "./slice-slide.types";

export const sliceSlideDef: IEffectExtensionDefinition = {
  effectId: SLICE_SLIDE_ANIMATION,
  effectFunc: sliceSlideAnimation,
};

export const sliceSlideAppDef: IEffectExtensionAppDefinition = {
  effectId: SLICE_SLIDE_ANIMATION,
  formDefaults: sliceSlideDefaults,
  formDefinition: sliceSlideDefinition,
};
