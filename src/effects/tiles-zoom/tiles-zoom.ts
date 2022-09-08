import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import { tilesZoomAnimation } from "./tiles-zoom.animation";
import {
  tilesZoomDefaults,
  tilesZoomDefinition,
} from "./tiles-zoom.definition";
import { TILES_ZOOM_ANIMATION } from "./tiles-zoom.types";

export const tilesZoomDef: IEffectExtensionDefinition = {
  effectId: TILES_ZOOM_ANIMATION,
  effectFunc: tilesZoomAnimation,
};

export const tilesZoomAppDef: IEffectExtensionAppDefinition = {
  effectId: TILES_ZOOM_ANIMATION,
  formDefaults: tilesZoomDefaults,
  formDefinition: tilesZoomDefinition,
};
