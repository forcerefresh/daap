import { getDefaultTimeline } from "../../inputs/timelines-input/timelines-input";
import { InputType } from "../../inputs/types";
import { timelinesEffect, ITimelinesEffect } from "./timelines.types";

export const cssPluginDefinition = {
  id: timelinesEffect,
  name: "Timelines",
  form: [
    {
      displayName: "Timelines",
      propertyName: "timelines",
      inputType: InputType.TIMELINES,
    },
  ],
};

export const cssPluginDefaults: ITimelinesEffect = {
  id: timelinesEffect,
  hasDelay: true,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: true,
  // effect properties
  timelines: {
    timelines: [getDefaultTimeline()],
  },
};
