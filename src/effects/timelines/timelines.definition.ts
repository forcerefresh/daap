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

export const getDefaultTimeline = (
  propertyName: string,
  property: string
): ITimelineValue => {
  return {
    propertyName,
    property,
    points: [
      getDefaultPoint("0ms", true, property),
      getDefaultPoint("1000ms", true, property),
    ],
    ease: "linear",
  };
};

export const getDefaultPoint = (
  time: string,
  enabled = false,
  property: string
): ITimelinePoint => {
  return {
    time,
    enabled,
    pointValue: getTimelinePointDefaultValueByProperty(property), //{
    // x: { enabled: false, value: 0, position: "rel" },
    // y: { enabled: false, value: 0, position: "rel" },
    // width: { enabled: false, value: 0, position: "rel" },
    // height: { enabled: false, value: 0, position: "rel" },
    // rotation: {
    //   enabled: false,
    //   value: 0,
    //   position: "rel" as "abs" | "rel",
    //   direction: "_ccw" as "_ccw" | "_cw" | "_short",
    // },
    // opacity: { enabled: false, value: 100, position: "rel" },
    // zoom: { enabled: false, value: 100, position: "rel" },
    // },
  };
};

const getTimelinePointDefaultValueByProperty = (property: string) => {
  switch (property) {
    case "translateX": {
      return { value: "0px" };
    }
    case "translateY": {
      return { value: "0px" };
    }
    case "translateZ": {
      return { value: "0px" };
    }
    case "opacity": {
      return { value: 0 };
    }
    default: {
      throw new Error(
        "Unknown property type (getTimelinePointDefaultValueByProperty)"
      );
    }
  }
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
    timelines: [
      /*getDefaultTimeline()*/
    ],
  },
};
