import gsap from "gsap";
import { IZoomInEffect, zoomIn } from "./zoom-in.types";

gsap.registerEffect({
  name: zoomIn,
  effect: function (targets: string | object | null, config: IZoomInEffect) {
    gsap.set(targets, {
      scale: config.fromScale / 100,
      transformOrigin: "50% 50% 0",
    });

    return gsap.to(targets, {
      //  z: 0.01,
      duration: config.duration!,
      scale: config.toScale / 100,
    });
  },
  defaults: {},
  extendTimeline: true,
});
