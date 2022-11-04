import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk2/lib/animations/animations-register";
import { tilesZoomAnimation } from "./tiles-zoom.animation";
import {
  tilesZoomDefaults,
  tilesZoomDefinition,
} from "./tiles-zoom.definition";
import { TILES_ZOOM_ANIMATION } from "./tiles-zoom.types";

export const tilesZoomDef: IAnimationExtensionDefinition = {
  animationId: TILES_ZOOM_ANIMATION,
  animationFunc: tilesZoomAnimation,
};

export const tilesZoomAppDef: IAnimationExtensionAppDefinition = {
  animationId: TILES_ZOOM_ANIMATION,
  formDefaults: tilesZoomDefaults,
  formDefinition: tilesZoomDefinition,
};
