import { AnimationType } from "../animations/types";
import { ITransitionsData } from "../export/i-export-html";
import {
  IExecCodeConfig,
  EXEC_CODE_ANIMATION,
} from "../objects/exec-code-animation";
import { ExecutionCodeFuncType } from "webslider-sdk/lib/objects/objects-register";
import { ITransition } from "webslider-sdk/lib/objects/i-object";
import { convertTimeUnitToMs } from "../utils/utils";
import { ITimelineConfig, Timeline } from "./player/Timeline";
import { RootTimeline } from "./player/RootTimeline";
export const DYNAMIC_OUT_EFF_TIMELINE_GROUP = "dynamic-out-eff-timeline-group";

export interface IEventTimeline {
  event: string;
  eventTargetId: string;
  reverseEvent: string;
  reverseEventTargetId: string;
  rootTimeline: RootTimeline;
}
export function createEventTimelineForObject(
  data: ITransitionsData
): IEventTimeline[] {
  const eventTimelines: IEventTimeline[] = [];

  data.transitions.event?.forEach((animTransition) => {
    const timeline = createTimelineForAnimation(data, animTransition, "event");
    const rootTimeline = new RootTimeline({
      name: "RootTimelineForEvent" + animTransition.event,
      duration: timeline.duration,
    });
    rootTimeline.add(timeline);

    eventTimelines.push({
      event: animTransition.event,
      eventTargetId: animTransition.eventTargetId,
      reverseEvent: animTransition.reverseEvent,
      reverseEventTargetId: animTransition.reverseEventTargetId,
      rootTimeline: rootTimeline,
    });
  });

  return eventTimelines;
}

export function createTimelineForObject(data: ITransitionsData): {
  effTls: Timeline[];
  outEffTlExist: boolean;
} {
  const effTls: Timeline[] = [];
  let outEffTlExist = false;

  // note only one per object

  data.transitions.in?.forEach((effIn) => {
    const tl = createTimelineForAnimation(data, effIn, "in");
    effTls.push(tl);
  });

  data.transitions.out?.forEach((effOut) => {
    // NOTE: only NOT "absolute" will have id in order to remove them
    const timelineGroup =
      effOut.outStartTime.inheritFrom === "absolute"
        ? undefined
        : DYNAMIC_OUT_EFF_TIMELINE_GROUP;

    const tl = createTimelineForAnimation(data, effOut, "out", timelineGroup);
    effTls.push(tl);

    if (effOut.outStartTime.inheritFrom === "inheritFromSlide") {
      outEffTlExist = true;
    }
  });

  data.transitions.animation?.forEach((animTransition) => {
    const tl = createTimelineForAnimation(data, animTransition, "animation");
    effTls.push(tl);
  });

  data.transitions.layer?.forEach((animTransition) => {
    const tl = createTimelineForAnimation(data, animTransition, "in");
    effTls.push(tl);
  });

  /*data.transitions.in?.forEach((_, idx) => {
    const transIn = data.transitions.in?.[idx];
    const transOut = data.transitions.out?.[idx];
    const transAnimation =
      data.transitions.animation?.[idx] || data.transitions.layer?.[idx]; // TODO: layer is added adhock

    populatesTimelinesForObject(data, parallelTimelines, {
      transIn,
      transOut,
      transAnimation,
    });
  });*/

  return {
    effTls,
    outEffTlExist,
  };
}

function getDuration(data: ITransitionsData, eff: ITransition): number {
  return eff.duration === "-1"
    ? convertTimeUnitToMs(data.data.slideDuration.customValue)
    : convertTimeUnitToMs(eff.duration);
}

function createTimelineForAnimation(
  data: ITransitionsData,
  eff: ITransition,
  effType: AnimationType,
  timelineGroup?: string,
  overwriteConfig?: Partial<ITimelineConfig>
) {
  // only out animation is different
  let delay = convertTimeUnitToMs(eff.delay);
  if (effType === "out") {
    if (eff.outStartTime.inheritFrom === "absolute") {
      delay =
        convertTimeUnitToMs(eff.outStartTime.customValue) +
        convertTimeUnitToMs(eff.delay);
    } else if (eff.outStartTime.inheritFrom === "inheritFromSlide") {
      delay =
        convertTimeUnitToMs(data.data.slideDuration.customValue) -
        convertTimeUnitToMs(data.data.exitSlideDuration.customValue);
    }
  }

  const tl = new Timeline({
    //timelineType: "object",
    ...(timelineGroup ? { group: timelineGroup } : {}),
    name: "ObjectTimeline",
    ...eff.animation.values,
    animationId: eff.animation.id,
    itemId: data.itemId,
    objectProperties: {
      width: data.data.objectWidth,
      height: data.data.objectHeight,
      left: data.data.objectLeft,
      top: data.data.objectTop,
      objectHtml: data.data.objectHtml,
    },
    type: effType,
    duration: getDuration(data, eff),
    ease: eff.ease,
    childEase: eff.childEase,
    timeDistribution: eff.timeDistribution,
    delay:
      overwriteConfig?.delay !== undefined ? overwriteConfig?.delay : delay,
    ///objects: data.data.ob......
    // ...(overwriteConfig ? { overwriteConfig } : {}),
  });
  return tl;
}

export function createTimelineForExecutionCode(
  data: ITransitionsData,
  execStart: ExecutionCodeFuncType,
  execStop: ExecutionCodeFuncType,

  values: { [key: string]: any },
  calculatedObjectSize: any
): Timeline {
  const conf: IExecCodeConfig & ITimelineConfig = {
    animationId: EXEC_CODE_ANIMATION,
    delay: 0,
    duration: convertTimeUnitToMs(data.data.slideDuration.customValue),
    //
    execStart,
    execStop,
    values: values,
    id: data.itemId,
    className: data.objectClass,
    calculatedObjectSize,
  };

  const tl = new Timeline(conf);

  return tl;
}
