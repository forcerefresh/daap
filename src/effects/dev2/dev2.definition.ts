import { InputType } from "../../webslider-sdk/src/inputs/i-inputs";
import { dev2, IDev2Effect } from "./dev2.types";

export const dev2Definition = {
  id: dev2,
  name: "Dev 2 *",
  form: [
    {
      displayName: "Colors",
      propertyName: "colors1",
      inputType: InputType.COLOR_ARRAY,
    },
    {
      displayName: "Number 1",
      propertyName: "number1",
      inputType: InputType.NUMBER,
      optional: true,
    },
    {
      displayName: "Number 2",
      propertyName: "number2",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Number 3",
      propertyName: "number3",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Number 4",
      propertyName: "number4",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "",
      propertyName: "hasAdvancedOptions",
      inputType: InputType.CHECKBOX,
    },
    {
      displayName: "Number 5",
      propertyName: "number5",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Number 6",
      propertyName: "number6",
      inputType: InputType.NUMBER,
    },
  ],
};

//export const dev2FormConfiguration =
export const dev2Defaults: IDev2Effect = {
  id: dev2,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out", "effect", "slide", "layer"],
  canBeCombined: true,
  // effect properties
  colors1: [{ r: 256, g: 256, b: 256, a: 1 }],
  number1: 1,
  number2: 2,
  number3: 3,
  number4: 4,
  hasAdvancedOptions: false,
  number5: 5,
  number6: 6,
};

export interface IFormPanelConfiguration {
  groupName: string;
  optional?: boolean;
  optionalProperty?: string;
  properties: { property: string; optional?: boolean }[];
}
