import gsap from "gsap";
import { IZoomInEffect, zoomIn } from "./zoom-in.types";

gsap.registerEffect({
  name: zoomIn,
  effect: function (targets: string | object | null, config: IZoomInEffect) {
    gsap.set(targets, { scale: config.fromScale / 100 });

    return gsap.to(targets, {
      duration: config.duration!,
      scale: config.toScale / 100,
    });
  },
  defaults: {},
  extendTimeline: true,
});
