import gsap from "gsap";
import React from "react";
import { ITransitionsData } from "../export/i-export-html";
import { executionCodeFuncType } from "../objects/objects-factory";
import { ITransition } from "../objects/types";
import { calculateObjectSize } from "../panels/stage-panel/StagePanelUtils";

export function createTimelineForObject(
  data: ITransitionsData
): gsap.core.Timeline[] {
  console.log(data);
  const parallelTimelines: gsap.core.Timeline[] = [];

  data.transitions.in?.forEach((_, idx) => {
    const effIn = data.transitions.in?.[idx];
    const effOut = data.transitions.out?.[idx];
    const effEffect =
      data.transitions.effect?.[idx] || data.transitions.layer?.[idx]; // TODO: layer is added adhock

    populatesTimelinesForObject(data, parallelTimelines, {
      effIn,
      effOut,
      effEffect,
    });
  });

  return parallelTimelines;
}

function getDuration(data: ITransitionsData, eff: ITransition) {
  return eff.duration === -1
    ? data.data.slideDuration.customValue
    : eff.duration;
}

function populatesTimelinesForObject(
  data: ITransitionsData,
  parallelTimelines: gsap.core.Timeline[],
  effProps: {
    effIn?: ITransition;
    effOut?: ITransition;
    effEffect?: ITransition;
  }
) {
  const { effIn, effOut, effEffect } = effProps;

  let tl;

  if (effIn || effOut) {
    tl = gsap.timeline();
    parallelTimelines.push(tl);

    let totalDuration = 0;
    if (effIn) {
      console.log(effIn);
      totalDuration += effIn.delay;

      // ONE: delay for IN effect
      (tl as any).add(
        gsap.to("." + data.objectClass, { duration: effIn.delay / 1000 })
      );
      totalDuration += getDuration(data, effIn);

      //console.log(getDuration(effIn));
      // TWO: duration for IN effect

      const ineff = gsap.effects[effIn.effect.id]("." + data.objectClass, {
        ...effIn.effect.values,
        objectProperties: {
          width: data.data.objectWidth,
          height: data.data.objectHeight,
          left: data.data.objectLeft,
          top: data.data.objectTop,
          objectHtml: data.data.objectHtml,
        },
        type: "in",
        duration: getDuration(data, effIn) / 1000,
        ease: effIn.ease,
        childEase: effIn.childEase,
        timeDistribution: effIn.timeDistribution,
      });
      (tl as any).add(ineff);
    }

    if (effOut) {
      let betweenGap =
        data.data.slideDuration.customValue -
        (getDuration(data, effOut) + effOut.delay);

      //console.log(betweenGap);
      if (effIn) {
        betweenGap -= getDuration(data, effIn) + effIn?.delay;
        //console.log(betweenGap);
      }
      //console.log(betweenGap);

      if (betweenGap > 0) {
        totalDuration += betweenGap;

        //console.log(betweenGap, "betweenGap");
        (tl as any).add(
          gsap.to("." + data.objectClass, { duration: betweenGap / 1000 })
        );
      }

      //console.log(totalDuration);

      totalDuration += getDuration(data, effOut);
      (tl as any).add(
        gsap.effects[effOut.effect.id](
          "." + data.objectClass,
          {
            ...effOut.effect.values,
            objectProperties: {
              width: data.data.objectWidth,
              height: data.data.objectHeight,
              left: data.data.objectLeft,
              top: data.data.objectTop,
              objectHtml: data.data.objectHtml,
            },
            type: "out",
            duration: getDuration(data, effOut) / 1000,
            delay: effOut.delay / 1000,
            ease: effOut.ease,
            childEase: effOut.childEase,
            timeDistribution: effOut.timeDistribution,
          },
          (data.data.slideDuration.customValue -
            getDuration(data, effOut) -
            effOut.delay) /
            1000
        )
      );

      totalDuration += effOut.delay;

      //console.log(totalDuration);
      (tl as any).add(
        gsap.to("." + data.objectClass, { duration: effOut.delay / 1000 })
      );
    }

    //console.log("total", totalDuration);
    //console.log("slide dur", data.data.slideDuration.customValue);
  }

  if (effEffect) {
    tl = gsap.timeline();
    parallelTimelines.push(tl);

    let totalDuration = 0;
    totalDuration += effEffect.delay;

    // ONE: delay for IN effect
    (tl as any).add(
      gsap.to("." + data.objectClass, { duration: effEffect.delay / 1000 })
    );

    totalDuration += getDuration(data, effEffect);
    // TWO: duration for IN effect
    const eff = gsap.effects[effEffect.effect.id]("." + data.objectClass, {
      ...effEffect.effect.values,
      objectProperties: {
        width: data.data.objectWidth,
        height: data.data.objectHeight,
        left: data.data.objectLeft,
        top: data.data.objectTop,
        objectHtml: data.data.objectHtml,
      },
      type: "in",
      duration: getDuration(data, effEffect) / 1000,
      ease: effEffect.ease,
      childEase: effEffect.childEase,
      timeDistribution: effEffect.timeDistribution,
    });
    (tl as any).add(eff);

    // THREE end gap
    let betweenGap =
      data.data.slideDuration.customValue -
      (getDuration(data, effEffect) + effEffect.delay);
    (tl as any).add(
      gsap.to("." + data.objectClass, { duration: betweenGap / 1000 })
    );
  }

  /* const endPointTl = gsap.to(
    {},
    { delay: data.data.slideDuration.customValue / 1000, duration: 0 }
  );
  parallelTimelines.push(endPointTl as any);*/

  return parallelTimelines;
}

export function createTimelineForExecutionCode(
  data: ITransitionsData,
  execCodeFunc: executionCodeFuncType,
  values: { [key: string]: any },
  calculatedObjectSize: any
): gsap.core.Timeline {
  const tl = new gsap.core.Timeline();

  const execCodeTween = gsap.effects["execCode"](
    {},
    {
      execCodeFunc,
      values: values,
      className: data.objectClass,
      calculatedObjectSize,
      slideDuration: data.data.slideDuration.customValue / 1000,
    }
  );
  (tl as any).add(execCodeTween);
  return tl;
}
