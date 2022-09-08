import {
  IEffectExtensionDefinition,
  IEffectExtensionAppDefinition,
} from "../../webslider-sdk/src/effects/effects-register";
import {
  tilesSlideDefaults,
  tilesSlideDefinition,
} from "./tiles-slide.definition";
import { tilesSlideAnimation } from "./tiles-slide.animation";
import { TILES_SLIDE_ANIMATION } from "./tiles-slide.types";

export const tilesSlideDef: IEffectExtensionDefinition = {
  effectId: TILES_SLIDE_ANIMATION,
  effectFunc: tilesSlideAnimation,
};

export const tilesSlideAppDef: IEffectExtensionAppDefinition = {
  effectId: TILES_SLIDE_ANIMATION,
  formDefaults: tilesSlideDefaults,
  formDefinition: tilesSlideDefinition,
};
