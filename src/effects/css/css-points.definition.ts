import { InputType } from "../../inputs/types";
import { cssEffect, ICSSPointsEffect } from "./css-points.types";

export const cssPluginDefinition = {
  id: cssEffect,
  name: "CSS Timeline",
  form: [
    {
      displayName: "CSS Timeline",
      propertyName: "cssPointsValue",
      inputType: InputType.CSS_TIMELINES,
    },
  ],
};

export const cssPluginDefaults: ICSSPointsEffect = {
  id: cssEffect,
  hasDelay: true,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  // specific to this effect
  cssPointsValue: {
    points: [
      {
        time: 50,
        css: {
          x: { value: 100, position: "abs" },
          y: { value: 100, position: "abs" },
          width: { value: 100, position: "abs" },
          height: { value: 100, position: "abs" },
          rotation: { value: 0, position: "abs", direction: "_ccw" },
        },
        easing: "none",
      },
    ],
  },
};
