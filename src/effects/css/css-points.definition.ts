import { getDefaultTimeline } from "../../inputs/css-plugin-input/css-plugin-input";
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
    timelines: [getDefaultTimeline()],
  },
};
