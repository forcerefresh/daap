import { fadeInDefaults, fadeInDefinition } from "./fade-in/fade-in";
import { noneDefaults, noneDefinition } from "./none/none";
import { zoomInDefaults, zoomInDefinition } from "./zoom-in/zoom-in";

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

//

interface IDefinitionWrapper {
  id: string;
  name: string;
  form: { [key: string]: any }[];
}
interface IDefaultsWrapper {
  [key: string]: any;
}
interface IEffectHolder {
  definition: IDefinitionWrapper;
  defaults: IDefaultsWrapper;
}

function registerEffect(
  definition: IDefinitionWrapper,
  defaults: IDefaultsWrapper
) {
  effects.push({
    definition,
    defaults,
  });
}
