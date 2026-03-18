import {
  IAnimationExtensionAppDefinition,
  IAnimationExtensionDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { sliceSlideAnimation } from "./slice-slide.animation";
import {
  sliceSlideDefaults,
  sliceSlideDefinition,
} from "./slice-slide.definition";
import { SLICE_SLIDE_ANIMATION } from "./slice-slide.types";

export const sliceSlideDef: IAnimationExtensionDefinition = {
  animationId: SLICE_SLIDE_ANIMATION,
  animationFunc: sliceSlideAnimation,
};

export const sliceSlideAppDef: IAnimationExtensionAppDefinition = {
  animationId: SLICE_SLIDE_ANIMATION,
  formDefaults: sliceSlideDefaults,
  formDefinition: sliceSlideDefinition,
};
