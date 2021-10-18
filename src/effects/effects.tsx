import { EffectType } from "./types";
import { fadeDefaults, fadeDefinition } from "./fade/fade.definition";
import { noneDefaults, noneDefinition } from "./none/none.definition";
import { zoomInDefaults, zoomInDefinition } from "./zoom/zoom.definition";
import { slideDefaults, slideDefinition } from "./slide/slide.definition";
import {
  kenBurnsDefaults,
  kenBurnsDefinition,
} from "./ken-burns/ken-burns.definition";
import {
  tilesZoomDefaults,
  tilesZoomDefinition,
} from "./tiles-zoom/tiles-zoom.definition";
import {
  tilesFadeDefaults,
  tilesFadeDefinition,
} from "./tiles-fade/tiles-fade.definition";
import {
  sliceSlideDefaults,
  sliceSlideDefinition,
} from "./slice-slide/slice-slide.definition";
import {
  sliceSlideInnerDefaults,
  tilesSlideInnerDefinition,
} from "./tiles-slide/tiles-slide.definition";
import {
  fallingLeavesDefaults,
  fallingLeavesDefinition,
} from "./falling-leaves/falling-leaves.definition";

import { cubeDefaults, cubeDefinition } from "./cube/cube.definition";
import { splitDefaults, splitDefinition } from "./split/split.definition";

import {
  parallaxDefaults,
  parallaxDefinition,
} from "./parallax/parallax.definition";

import { morphDefaults, morphDefinition } from "./morph/morph.definition";
import {
  magneticDefaults,
  magneticDefinition,
} from "./magnetic/magnetic.definition";
import {
  typewriterDefaults,
  typewriterDefinition,
} from "./typewriter/typewriter.definition";
import {
  splitTextDefaults,
  splitTextDefinition,
} from "./split-text/split-text.definition";

import {
  canvasCopyDefaults,
  canvasCopyDefinition,
} from "./canvas-copy/canvas-copy.definition";

import {
  squareMaskDefaults,
  squareMaskDefinition,
} from "./square-mask/square-mask.definition";

import {
  trianglifyDefaults,
  trianlifyDefinition,
} from "./trianglify/trianglify.definition";
// NOTE effect for development
import { devDefaults, devDefinition } from "./dev/dev.definition";

// import all effects
import "./none/none.effect";
import "./fade/fade.effect";
import "./zoom/zoom.effect";
import "./slide/slide.effect";
import "./ken-burns/ken-burns.effect";
import "./tiles-zoom/tiles-zoom.effect";
import "./tiles-fade/tiles-fade.effect";
import "./slice-slide/slice-slide.effect";
import "./tiles-slide/tiles-slide.effect";
import "./tiles-slide/tiles-slide.effect";
import "./falling-leaves/falling-leaves.effect";
import "./cube/cube.effect";
import "./split/split.effect";
import "./parallax/parallax.effect";
import "./morph/morph.effect";
import "./magnetic/magnetic.effect";
import "./typewriter/typewriter.effect";
import "./split-text/split-text.effect";
import "./canvas-copy/canvas-copy.effect";
import "./square-mask/square-mask.effect";
import "./dev/dev.effect";

import { getTypewriterEffectDuration } from "./typewriter/typewriter.effect";
import "./trianglify/trianglify.effect";

// interfaces for APP >>>
interface IEffectDefinitionWrapper {
  id: string;
  name: string;
  form: { [key: string]: any }[];
}
interface IEffectDefaultsWrapper {
  [key: string]: any;
}
interface IEffectHolder {
  definition: IEffectDefinitionWrapper;
  defaults: IEffectDefaultsWrapper;
  getDuration?: (object?: any, config?: any) => number;
}
// <<<

const effects: IEffectHolder[] = [];

registerEffect(noneDefinition, noneDefaults);
registerEffect(fadeDefinition, fadeDefaults);
registerEffect(zoomInDefinition, zoomInDefaults);
registerEffect(slideDefinition, slideDefaults);
registerEffect(kenBurnsDefinition, kenBurnsDefaults);
registerEffect(tilesZoomDefinition, tilesZoomDefaults);
registerEffect(tilesFadeDefinition, tilesFadeDefaults);
registerEffect(tilesSlideInnerDefinition, sliceSlideInnerDefaults);
registerEffect(sliceSlideDefinition, sliceSlideDefaults);
registerEffect(fallingLeavesDefinition, fallingLeavesDefaults);
registerEffect(cubeDefinition, cubeDefaults);
registerEffect(splitDefinition, splitDefaults);
registerEffect(parallaxDefinition, parallaxDefaults);
registerEffect(morphDefinition, morphDefaults);
registerEffect(magneticDefinition, magneticDefaults);
registerEffect(
  typewriterDefinition,
  typewriterDefaults,
  getTypewriterEffectDuration
);
registerEffect(splitTextDefinition, splitTextDefaults);
registerEffect(canvasCopyDefinition, canvasCopyDefaults);
registerEffect(squareMaskDefinition, squareMaskDefaults);
registerEffect(trianlifyDefinition, trianglifyDefaults);
registerEffect(devDefinition, devDefaults);

function registerEffect(
  definition: IEffectDefinitionWrapper,
  defaults: IEffectDefaultsWrapper,
  getDuration?: (object?: any, config?: any) => number
) {
  effects.push({
    definition,
    defaults,
    getDuration,
  });
}

export function getEffectDefinition(effectId: string): IEffectHolder {
  return effects.find(
    (item) => item.definition.id === effectId
  ) as IEffectHolder;
}

export function getEffectsOptions(
  effectType: EffectType
): { label: string; value: string }[] {
  return effects
    .filter(
      (eff) =>
        (eff.defaults.supportedEffectTypes as EffectType[]).indexOf(
          effectType
        ) !== -1
    )
    .map((item) => ({
      value: item.definition.id,
      label: item.definition.name,
    }));
}
