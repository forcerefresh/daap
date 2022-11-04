import {
  getTypewriterAnimationDuration,
  typewriterAnimation,
} from "./typewriter.animation";
import {} from "webslider-sdk2/lib/animations/i-animation-types";
import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk2/lib/animations/animations-register";
import {
  typewriterDefaults,
  typewriterDefinition,
} from "./typewriter.definition";
import { TYPEWRITER_ANIMATION } from "./typewriter.types";

export const typewriterDef: IAnimationExtensionDefinition = {
  animationId: TYPEWRITER_ANIMATION,
  animationFunc: typewriterAnimation,
};

export const typewriterAppDef: IAnimationExtensionAppDefinition = {
  animationId: TYPEWRITER_ANIMATION,
  formDefaults: typewriterDefaults,
  formDefinition: typewriterDefinition,
  getDuration: getTypewriterAnimationDuration,
};
