import { InputType } from "../../inputs/types";
import { dev2, IDev2Effect } from "./dev2.types";

export const dev2Definition = {
  id: dev2,
  name: "Dev 2 *",
  form: [
    {
      displayName: "Colors",
      propertyName: "colors1",
      inputType: InputType.COLOR_ARRAY_PRESETS,
    },
    {
      displayName: "Number 1",
      propertyName: "number1",
      inputType: InputType.NUMBER,
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
  colors1: [{ r: 256, g: 256, b: 256, a: 1 }],
  number1: 1,
  number2: 2,
  number3: 3,
  number4: 4,
  number5: 5,
  number6: 6,
};
