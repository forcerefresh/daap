import { fadeRangeAnimation } from "./fade-range.animation";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import {
  fadeRangeDefaults,
  fadeRangeDefinition,
} from "./fade-range.definition";
import { FADE_RANGE_ANIMATION } from "./fade-range.types";

export const fadeRangeDef: IAnimationExtensionDefinition = {
  animationId: FADE_RANGE_ANIMATION,
  animationFunc: fadeRangeAnimation,
};

export const fadeRangeAppDef: IAnimationExtensionAppDefinition = {
  animationId: FADE_RANGE_ANIMATION,
  formDefaults: fadeRangeDefaults,
  formDefinition: fadeRangeDefinition,
};
