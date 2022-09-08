import gsap from "gsap";
import { getMethodByType } from "../common";
import { FADE_ANIMATION, IFadeEffect } from "./fade.types";

gsap.registerEffect({
  name: FADE_ANIMATION,
  effect: function (targets: any, config: IFadeEffect) {
    return gsap[getMethodByType(config.type)](targets, {
      ease: config.ease,
      duration: config.duration!,
      opacity: 0,
    });
  },

  defaults: {},
  extendTimeline: true,
});
