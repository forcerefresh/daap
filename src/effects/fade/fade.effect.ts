import gsap from "gsap";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { fade, IFadeEffect } from "./fade.types";

gsap.registerEffect({
  name: fade,
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
