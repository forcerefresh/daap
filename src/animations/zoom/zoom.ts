import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk2/lib/animations/animations-register";
import { zoomAnimation } from "./zoom.animation";
import { zoomDefaults, zoomDefinition } from "./zoom.definition";
import { ZOOM_ANIMATION } from "./zoom.types";

export const zoomDef: IAnimationExtensionDefinition = {
  animationId: ZOOM_ANIMATION,
  animationFunc: zoomAnimation,
};

export const zoomAppDef: IAnimationExtensionAppDefinition = {
  animationId: ZOOM_ANIMATION,
  formDefaults: zoomDefaults,
  formDefinition: zoomDefinition,
};
