import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { zoomAnimation } from "./zoom.animation";
import { zoomDefaults, zoomDefinition } from "./zoom.definition";
import { ZOOM_ANIMATION } from "./zoom.types";

export const zoomDef: IEffectExtensionDefinition = {
  effectId: ZOOM_ANIMATION,
  effectFunc: zoomAnimation,
};

export const zoomAppDef: IEffectExtensionAppDefinition = {
  effectId: ZOOM_ANIMATION,
  formDefaults: zoomDefaults,
  formDefinition: zoomDefinition,
};
