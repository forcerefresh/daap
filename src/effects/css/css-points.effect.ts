import gsap from "gsap";
import {
  relativePosition2Gsap,
  relativeRotation2Gsap,
} from "../../inputs/cast-utils";
import { cssEffect, ICSSPointsEffect } from "./css-points.types";

gsap.registerEffect({
  name: cssEffect,
  effect: function (targets: any, config: ICSSPointsEffect) {
    const objectEl = targets[0] as HTMLElement;

    const tl = gsap.timeline();

    for (let j = 0; j < config.cssPointsValue.timelines.length; j++) {
      const tlTl = gsap.timeline();
      tl.add(tlTl, 0);
      const points = config.cssPointsValue.timelines[j].points;
      let currentTime = 0;
      for (let i = 0; i < points.length; i++) {
        const { time, css, easing } = points[i];
        const cssValue = {
          ...(css.x.value ? { x: relativePosition2Gsap(css.x) } : {}),
          ...(css.y.value ? { y: relativePosition2Gsap(css.y) } : {}),
          ...(css.width.value
            ? { width: relativePosition2Gsap(css.width) }
            : {}),
          ...(css.height.value
            ? { height: relativePosition2Gsap(css.height) }
            : {}),
          ...(css.rotation.value
            ? { rotation: relativeRotation2Gsap(css.rotation) }
            : {}),
        };
        const dur = config.duration! * (time / 100) - currentTime;
        currentTime = dur;
        tlTl.add(gsap.to(objectEl, { duration: dur, css: cssValue }));
      }
    }
    return tl;
  },
});
