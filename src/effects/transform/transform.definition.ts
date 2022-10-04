import {
  InputType,
  ITimelinePoint,
  ITimelinesInput,
  ITimelineValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { TRANSFORM_EFFECT, ITransformEffect } from "./transform.types";

export type ITimelinesEffectTuple = [ITimelinesInput<"transform">];

export const timelinesDefinition: IEffectDefinition<ITimelinesEffectTuple> = {
  id: TRANSFORM_EFFECT,
  name: "Transform",
  form: [
    {
      displayName: "Transform",
      propertyName: "transform",
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
    pointValue: getTimelinePointDefaultValueByProperty(property),
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
    case "scaleX": {
      return "100%";
    }
    case "scaleY": {
      return "100%";
    }
    case "scaleZ": {
      return "100%";
    }
    case "rotateX": {
      return "0deg";
    }
    case "rotateY": {
      return "0deg";
    }
    case "rotateZ": {
      return "0deg";
    }
    case "opacity": {
      return 100;
    }
    case "blur": {
      return 1;
    }
    default: {
      throw new Error(
        "Unknown property type (getTimelinePointDefaultValueByProperty)"
      );
    }
  }
};
export const timelinesDefaults: ITransformEffect = {
  id: TRANSFORM_EFFECT,
  hasDelay: true,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: true,
  // effect properties
  transform: {
    maxDuration: "1000ms",
    timelines: [
      /*getDefaultTimeline()*/
    ],
  },
};
