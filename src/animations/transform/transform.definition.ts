import {
  InputType,
  ITimelinePoint,
  ITimelinesInput,
  ITimelineValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import { TRANSFORM_ANIMATION, ITransformAnimation } from "./transform.types";

export type ITimelinesAnimationTuple = [ITimelinesInput<"transform">];

export const timelinesDefinition: IAnimationDefinition<ITimelinesAnimationTuple> =
  {
    id: TRANSFORM_ANIMATION,
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
export const timelinesDefaults: ITransformAnimation = {
  id: TRANSFORM_ANIMATION,
  hasDelay: true,
  hasDuration: false,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out"],
  canBeCombined: true,
  // animation properties
  transform: {
    maxDuration: "1000ms",
    timelines: [
      /*getDefaultTimeline()*/
    ],
  },
};
