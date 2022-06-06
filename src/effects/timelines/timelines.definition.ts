import {
  InputType,
  ITimelinePoint,
  ITimelinesInput,
  ITimelineValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
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

export const getDefaultTimeline = (): ITimelineValue => {
  return {
    points: [getDefaultPoint()],
  };
};

export const getDefaultPoint = (time = 100): ITimelinePoint => {
  return {
    time,
    easing: "none",
    pointValue: {
      x: { enabled: false, value: 0, position: "rel", easing: "none" },
      y: { enabled: false, value: 0, position: "rel", easing: "none" },
      width: { enabled: false, value: 0, position: "rel", easing: "none" },
      height: { enabled: false, value: 0, position: "rel", easing: "none" },
      rotation: {
        enabled: false,
        value: 0,
        position: "rel" as "abs" | "rel",
        direction: "_ccw" as "_ccw" | "_cw" | "_short",
      },
      opacity: { enabled: false, value: 100, position: "rel", easing: "none" },
      zoom: { enabled: false, value: 100, position: "rel", easing: "none" },
    },
  };
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
