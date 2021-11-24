import gsap from "gsap";
import { relativePosition2Gsap } from "../../inputs/cast-utils";
import { cssEffect, ICSSPointsEffect } from "./css-points.types";

gsap.registerEffect({
  name: cssEffect,
  effect: function (targets: any, config: ICSSPointsEffect) {
    const objectEl = targets[0] as HTMLElement;

    const tl = gsap.timeline();

    const points = config.cssPointsValue.points;
    const currentTime = 0;
    for (let i = 0; i < points.length; i++) {
      const { time, css, easing } = points[i];
      const cssValue = {
        ...(css.x.value ? { x: relativePosition2Gsap(css.x) } : {}),
        ...(css.y.value ? { y: relativePosition2Gsap(css.y) } : {}),
        ...(css.width.value ? { width: relativePosition2Gsap(css.width) } : {}),
        ...(css.height.value
          ? { height: relativePosition2Gsap(css.height) }
          : {}),
      };
      const dur = config.duration! * (time / 100);

      console.log(dur);
      tl.add(gsap.to(objectEl, { duration: dur, css: cssValue }));
    }

    return tl;
  },
});
