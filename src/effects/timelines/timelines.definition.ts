import { getDefaultTimeline } from "../../inputs/timelines-input/timelines-input";
import { InputType, ITimelinesInput } from "../../inputs/types";
import { IEffectDefinition } from "../types";
import { timelinesEffect, ITimelinesEffect } from "./timelines.types";

export type ITimelinesEffectTuple = [ITimelinesInput<"timelines">];

export const cssPluginDefinition: IEffectDefinition<ITimelinesEffectTuple> = {
  id: timelinesEffect,
  name: "Timelines",
  form: [
    {
      displayName: "Timelines",
      propertyName: "timelines",
      inputType: InputType.TIMELINES,
      value: {} as any,
      defaultValue: {} as any,
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
