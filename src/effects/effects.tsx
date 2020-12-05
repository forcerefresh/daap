import { fadeInDefaults, fadeInDefinition } from "./fade-in/fade-in.definition";
import { noneDefaults, noneDefinition } from "./none/none.definition";
import { zoomInDefaults, zoomInDefinition } from "./zoom-in/zoom-in.definition";
import {
  slideInDefaults,
  slideInDefinition,
} from "./slide-in/slide-in.definition";

// import all effects
import "./none/none.effect";
import "./fade-in/fade-in.effect";
import "./zoom-in/zoom-in.effect";
import "./slide-in/slide-in.effect";

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
