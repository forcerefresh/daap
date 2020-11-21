import { fadeInDefaults, fadeInDefinition } from "./fade-in/fade-in.definition";
import { noneDefaults, noneDefinition } from "./none/none";
import { zoomInDefaults, zoomInDefinition } from "./zoom-in/zoom-in";
//import all effects
import "./fade-in/fade-in.effect";

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

const effects: IEffectHolder[] = [];

registerEffect(noneDefinition, noneDefaults);
registerEffect(fadeInDefinition, fadeInDefaults);
registerEffect(zoomInDefinition, zoomInDefaults);

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

function registerEffect(
  definition: IEffectDefinitionWrapper,
  defaults: IEffectDefaultsWrapper
) {
  effects.push({
    definition,
    defaults,
  });
}
