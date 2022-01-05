import gsap from "gsap";
import {
  relativePosition2Gsap,
  relativeRotation2Gsap,
} from "../../inputs/cast-utils";
import { timelinesEffect, ITimelinesEffect } from "./timelines.types";

gsap.registerEffect({
  name: timelinesEffect,
  effect: function (targets: any, config: ITimelinesEffect) {
    const objectEl = targets[0] as HTMLElement;

    const tl = gsap.timeline();

    for (let j = 0; j < config.timelines.timelines.length; j++) {
      const tlTl = gsap.timeline();
      tl.add(tlTl, 0);
      const points = config.timelines.timelines[j].points;

      sortPoints(points);
      let currentTime = 0;
      let startFrom = 0;
      for (let i = 0; i < points.length; i++) {
        const { time, pointValue, easing } = points[i];
        const cssValue = {
          ...(pointValue.x.enabled
            ? { x: relativePosition2Gsap(pointValue.x) }
            : {}),
          ...(pointValue.y.enabled
            ? { y: relativePosition2Gsap(pointValue.y) }
            : {}),
          ...(pointValue.width.enabled
            ? { width: relativePosition2Gsap(pointValue.width) }
            : {}),
          ...(pointValue.height.enabled
            ? { height: relativePosition2Gsap(pointValue.height) }
            : {}),
          ...(pointValue.rotation.enabled
            ? { rotation: relativeRotation2Gsap(pointValue.rotation) }
            : {}),
          ...(pointValue.opacity.enabled
            ? {
                opacity: relativePosition2Gsap({
                  ...pointValue.opacity,
                  value: pointValue.opacity.value / 100,
                }),
              }
            : {}),
        };
        const dur = config.duration! * (time / 100) - currentTime;
        currentTime = dur;
        tlTl.add(
          gsap.to(objectEl, { duration: dur, css: cssValue, ease: easing }),
          startFrom
        );
        startFrom += dur;
      }
    }
    return tl;
  },
});

function sortPoints(points: any[]) {
  points.sort((a, b) => {
    return a.time > b.time ? 1 : -1;
  });
}
