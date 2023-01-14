import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import { textAnimation } from "./text.animation";
import { textDefaults, textDefinition } from "./text.definition";
import { TEXT_ANIMATION } from "./text.types";

export const textDef: IAnimationExtensionDefinition = {
  animationId: TEXT_ANIMATION,
  animationFunc: textAnimation,
};

export const textAppDef: IAnimationExtensionAppDefinition = {
  animationId: TEXT_ANIMATION,
  formDefaults: textDefaults,
  formDefinition: textDefinition,
  //getDuration: () => 5000,
};
