import gsap from "gsap";
import { getMethodByType } from "../common";
import { IZoomInAnimation, ZOOM_ANIMATION } from "./zoom.types";

gsap.registerEffect({
  name: ZOOM_ANIMATION,
  effect: function (targets: any, config: IZoomInAnimation) {
    if (config.type === "in") {
      return gsap.fromTo(
        targets,
        { scaleX: 0, scaleY: 0 },
        {
          ease: config.ease,
          duration: config.duration!,
          scaleX: config.scaleX / 100,
          scaleY: config.scaleY / 100,
        }
      );
    } else {
      return gsap.to(targets, {
        ease: config.ease,
        duration: config.duration!,
        scaleX: 0,
        scaleY: 0,
      });
    }
  },
  defaults: {},
  extendTimeline: true,
});
