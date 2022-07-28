import gsap from "gsap";
import React from "react";
import { EffectType } from "../effects/types";
import { ITransitionsData } from "../export/i-export-html";
import { ExecCodeConfig } from "../objects/exec-code-effect";
import { ExecutionCodeFuncType } from "../webslider-sdk/src/objects/objects-register";
import { ITransition } from "../webslider-sdk/src/objects/i-object";
import { convertTimeUnitToMs } from "../utils/utils";

export function createTimelineForObject(
  data: ITransitionsData
): gsap.core.Timeline[] {
  const parallelTimelines: gsap.core.Timeline[] = [];

  data.transitions.in?.forEach((effIn) => {
    populatesTimelinesForObject(data, parallelTimelines, effIn, "in");
  });
  data.transitions.out?.forEach((effOut) => {
    populatesTimelinesForObject(data, parallelTimelines, effOut, "out");
  });
  data.transitions.effect?.forEach((effEffect) => {
    populatesTimelinesForObject(data, parallelTimelines, effEffect, "effect");
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

  return parallelTimelines;
}

function getDuration(data: ITransitionsData, eff: ITransition): number {
  return eff.duration === "-1"
    ? convertTimeUnitToMs(data.data.slideDuration.customValue)
    : convertTimeUnitToMs(eff.duration);
}

function populatesTimelinesForObject(
  data: ITransitionsData,
  parallelTimelines: gsap.core.Timeline[],
  eff: ITransition,
  effType: EffectType
) {
  // only out effect is different
  const delay =
    (effType === "out"
      ? convertTimeUnitToMs(data.data.slideDuration.customValue) -
        (getDuration(data, eff) + convertTimeUnitToMs(eff.delay))
      : convertTimeUnitToMs(eff.delay)) / 1000;

  const tl = gsap.timeline();
  parallelTimelines.push(tl);

  const effTl = gsap.effects[eff.effect.id]("." + data.objectClass, {
    ...eff.effect.values,
    objectProperties: {
      width: data.data.objectWidth,
      height: data.data.objectHeight,
      left: data.data.objectLeft,
      top: data.data.objectTop,
      objectHtml: data.data.objectHtml,
    },
    type: effType,
    duration: getDuration(data, eff) / 1000,
    ease: eff.ease,
    childEase: eff.childEase,
    timeDistribution: eff.timeDistribution,
  });

  tl.add(effTl, delay);

  return parallelTimelines;
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
