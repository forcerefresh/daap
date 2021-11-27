import { property } from "lodash";
import { InputType } from "../../inputs/types";
import { dev, IDevEffect } from "./dev.types";

export const devDefinition = {
  id: dev,
  name: "Dev *",
  form: [
    {
      displayName: "Colors",
      helperText: "ccc",
      propertyName: "colors1",
      inputType: InputType.COLOR_ARRAY_PRESETS,
    },
    {
      displayName: "Slider",
      helperText: "",
      propertyName: "slider",
      inputType: InputType.SLIDER_INPUT,
      inputProperties: {
        min: -200,
        max: 1000,
        sufix: "%",
        stepSize: 1,
        labelStepSize: 5,
        trackFill: false,
        thumbPosition: "top",
        hideLabels: false,
      },
    },
    {
      displayName: "Opcije",
      helperText: "dsfdsfsd safdsa das dsad sa das",
      propertyName: "buttonGroup",
      inputType: InputType.BUTTON_GROUP_INPUT,
      options: [
        { label: "Tab1", value: "Tab1" },
        { label: "Tab2", value: "Tab2" },
      ],
    },
  ],
};

export const devDefaults: IDevEffect = {
  id: dev,
  hasDelay: false,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out", "effect", "slide", "layer"],
  colors1: [{ r: 256, g: 256, b: 256, a: 1 }],
  slider: 33,
  buttonGroup: "Tab1",
};
