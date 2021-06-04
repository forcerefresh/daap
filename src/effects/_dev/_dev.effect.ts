import gsap from "gsap";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { _dev, IDevEffect } from "./_dev.types";

gsap.registerEffect({
  name: _dev,
  effect: function (targets: any, config: IDevEffect) {
    return gsap[getMethodByType(config.type)](targets, {
      ease: config.ease,
      duration: config.duration!,
      opacity: 0,
    });
  },

  defaults: {},
  extendTimeline: true,
});
