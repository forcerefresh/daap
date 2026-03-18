import {
  IAnimationExtensionDefinition,
  IAnimationExtensionAppDefinition,
} from "webslider-sdk/lib/animations/animations-register";
import {
  tilesSlideDefaults,
  tilesSlideDefinition,
} from "./tiles-slide.definition";
import { tilesSlideAnimation } from "./tiles-slide.animation";
import { TILES_SLIDE_ANIMATION } from "./tiles-slide.types";

export const tilesSlideDef: IAnimationExtensionDefinition = {
  animationId: TILES_SLIDE_ANIMATION,
  animationFunc: tilesSlideAnimation,
};

export const tilesSlideAppDef: IAnimationExtensionAppDefinition = {
  animationId: TILES_SLIDE_ANIMATION,
  formDefaults: tilesSlideDefaults,
  formDefinition: tilesSlideDefinition,
};
