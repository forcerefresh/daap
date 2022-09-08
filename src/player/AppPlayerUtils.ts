import gsap from "gsap";
import React from "react";
import { EffectType } from "../effects/types";
import { ITransitionsData } from "../export/i-export-html";
import { ExecCodeConfig } from "../objects/exec-code-effect";
import { ExecutionCodeFuncType } from "../webslider-sdk/src/objects/objects-register";
import { ITransition } from "../webslider-sdk/src/objects/i-object";
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

  data.transitions.event?.forEach((effEffect) => {
    const timeline = createTimelineForEffect(data, effEffect, "event");
    const rootTimeline = new RootTimeline({
      name: "RootTimelineForEvent" + effEffect.event,
      duration: timeline.duration,
    });
    rootTimeline.add(timeline);

    eventTimelines.push({
      event: effEffect.event,
      eventTargetId: effEffect.eventTargetId,
      reverseEvent: effEffect.reverseEvent,
      reverseEventTargetId: effEffect.reverseEventTargetId,
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
    const tl = createTimelineForEffect(data, effIn, "in");
    effTls.push(tl);
  });

  data.transitions.out?.forEach((effOut) => {
    // NOTE: only NOT "absolute" will have id in order to remove them
    const timelineGroup =
      effOut.outStartTime.inheritFrom === "absolute"
        ? undefined
        : DYNAMIC_OUT_EFF_TIMELINE_GROUP;

    const tl = createTimelineForEffect(data, effOut, "out", timelineGroup);
    effTls.push(tl);

    if (effOut.outStartTime.inheritFrom === "inheritFromSlide") {
      outEffTlExist = true;
    }
  });

  data.transitions.effect?.forEach((effEffect) => {
    const tl = createTimelineForEffect(data, effEffect, "effect");
    effTls.push(tl);
  });

  /*data.transitions.in?.forEach((_, idx) => {
    const effIn = data.transitions.in?.[idx];
    const effOut = data.transitions.out?.[idx];
    const effEffect =
      data.transitions.effect?.[idx] || data.transitions.layer?.[idx]; // TODO: layer is added adhock

    populatesTimelinesForObject(data, parallelTimelines, {
      effIn,
      effOut,
      effEffect,
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

function createTimelineForEffect(
  data: ITransitionsData,
  eff: ITransition,
  effType: EffectType,
  timelineGroup?: string,
  overwriteConfig?: Partial<ITimelineConfig>
) {
  // only out effect is different
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
    ...eff.effect.values,
    effectId: eff.effect.id,
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
): gsap.core.Timeline {
  const tl = new gsap.core.Timeline();

  const conf: ExecCodeConfig = {
    execStart,
    execStop,
    values: values,
    id: data.itemId,
    className: data.objectClass,
    calculatedObjectSize,
    slideDuration:
      convertTimeUnitToMs(data.data.slideDuration.customValue) / 1000,
  };
  const execCodeTween = gsap.effects["execCode"]({}, conf);
  tl.add(execCodeTween);
  return tl;
}
