import { InputType } from "../../inputs/types";
import { cssEffect, ICSSPointsEffect } from "./css-points.types";

export const cssPluginDefinition = {
  id: cssEffect,
  name: "CSS Timeline",
  form: [
    {
      displayName: "CSS Timeline",
      propertyName: "cssPointsValue",
      inputType: InputType.CSS_POINTS,
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
          x: 100,
          y: 100,
          width: 200,
          height: 300,
          rotation: 0,
        },
        easing: "none",
      },
    ],
  },
};
