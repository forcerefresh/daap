import {
  InputType,
  ITimelinePoint,
  ITimelinesInput,
  ITimelineValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { TIMELINES_EFFECT, ITimelinesEffect } from "./timelines.types";

export type ITimelinesEffectTuple = [ITimelinesInput<"timelines">];

export const timelinesDefinition: IEffectDefinition<ITimelinesEffectTuple> = {
  id: TIMELINES_EFFECT,
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
    name: "Timeline 1",
    ease: "linear",
    first: getDefaultPoint("0ms"),
    last: getDefaultPoint("1000ms"),
  };
};

export const getDefaultPoint = (time: string): ITimelinePoint => {
  return {
    time,
    pointValue: {
      x: { enabled: false, value: 0, position: "rel" },
      y: { enabled: false, value: 0, position: "rel" },
      width: { enabled: false, value: 0, position: "rel" },
      height: { enabled: false, value: 0, position: "rel" },
      rotation: {
        enabled: false,
        value: 0,
        position: "rel" as "abs" | "rel",
        direction: "_ccw" as "_ccw" | "_cw" | "_short",
      },
      opacity: { enabled: false, value: 100, position: "rel" },
      zoom: { enabled: false, value: 100, position: "rel" },
    },
  };
};

export const timelinesDefaults: ITimelinesEffect = {
  id: TIMELINES_EFFECT,
  hasDelay: true,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: true,
  // effect properties
  timelines: {
    maxDuration: "1000ms",
    timelines: [getDefaultTimeline()],
  },
};
