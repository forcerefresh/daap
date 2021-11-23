import gsap from "gsap";
import { cssEffect, ICSSPointsEffect } from "./css-points.types";

gsap.registerEffect({
  name: cssEffect,
  effect: function (targets: any, config: ICSSPointsEffect) {
    const objectEl = targets[0] as HTMLElement;

    return gsap.to([], {
      duration: config.duration!,
    });
  },
});
