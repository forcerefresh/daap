import gsap from "gsap";
import { IZoomInEffect, zoomIn } from "./zoom-in.types";

gsap.registerEffect({
  name: zoomIn,
  effect: function (targets: string | object | null, config: IZoomInEffect) {
    console.log(config);
    gsap.set(targets, {
      scale: config.fromScale / 100,
      transformOrigin: "50% 50% 0",
    });

    return gsap.to(targets, {
      // z: 0.01,
      ease: config.ease,
      duration: config.duration!,
      scaleX: config.toScale / 100,
      scaleY: config.toScale / 100,
    });
  },
  defaults: {},
  extendTimeline: true,
});
