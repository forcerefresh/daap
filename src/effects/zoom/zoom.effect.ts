import gsap from "gsap";
import { getMethodByType } from "../common";
import { IZoomInEffect, zoomIn } from "./zoom.types";

gsap.registerEffect({
  name: zoomIn,
  effect: function (targets: any, config: IZoomInEffect) {
    return gsap[getMethodByType(config.type)](targets, {
      ease: config.ease,
      duration: config.duration!,
      scaleX: 0,
      scaleY: 0,
    });
  },
  defaults: {},
  extendTimeline: true,
});
