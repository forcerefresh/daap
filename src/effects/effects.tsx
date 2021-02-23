import { fadeInDefaults, fadeInDefinition } from "./fade-in/fade-in.definition";
import { noneDefaults, noneDefinition } from "./none/none.definition";
import { zoomInDefaults, zoomInDefinition } from "./zoom-in/zoom-in.definition";
import {
  slideInDefaults,
  slideInDefinition,
} from "./slide-in/slide-in.definition";
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
  sliceSlideInnerDefinition,
} from "./slice-slide-inner/slice-slide-inner.definition";

import {
  fallingLeavesDefaults,
  fallingLeavesDefinition,
} from "./falling-leaves/falling-leaves.definition";
// import all effects
import "./none/none.effect";
import "./fade-in/fade-in.effect";
import "./zoom-in/zoom-in.effect";
import "./slide-in/slide-in.effect";
import "./ken-burns/ken-burns.effect";
import "./tiles-zoom/tiles-zoom.effect";
import "./tiles-fade/tiles-fade.effect";
import "./slice-slide/slice-slide.effect";
import "./slice-slide-inner/slice-slide-inner.effect";
import "./falling-leaves/falling-leaves.effect";
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
}
// <<

const effects: IEffectHolder[] = [];

registerEffect(noneDefinition, noneDefaults);
registerEffect(fadeInDefinition, fadeInDefaults);
registerEffect(zoomInDefinition, zoomInDefaults);
registerEffect(slideInDefinition, slideInDefaults);
registerEffect(kenBurnsDefinition, kenBurnsDefaults);
registerEffect(tilesZoomDefinition, tilesZoomDefaults);
registerEffect(tilesFadeDefinition, tilesFadeDefaults);
registerEffect(sliceSlideDefinition, sliceSlideDefaults);
registerEffect(sliceSlideInnerDefinition, sliceSlideInnerDefaults);
registerEffect(fallingLeavesDefinition, fallingLeavesDefaults);

function registerEffect(
  definition: IEffectDefinitionWrapper,
  defaults: IEffectDefaultsWrapper
) {
  effects.push({
    definition,
    defaults,
  });
}

export function getEffectDefinition(effectId: string): IEffectHolder {
  return effects.find(
    (item) => item.definition.id === effectId
  ) as IEffectHolder;
}

export function getEffectsOptions(): { label: string; value: string }[] {
  return effects.map((item) => ({
    value: item.definition.id,
    label: item.definition.name,
  }));
}
