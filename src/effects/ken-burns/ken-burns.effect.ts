import gsap from "gsap";
import { IKenBurnsEffect, kenBurns } from "./ken-burns.types";

gsap.registerEffect({
  name: kenBurns,
  effect: function (targets: string | object | null, config: IKenBurnsEffect) {
    gsap.set(targets, {
      transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
    });
    
    // scale factor are increasing through the time
    const totalScaleFactor = (config.scaleFactor * config.duration!) / 100 + 1;

    return gsap.to(targets, {
      duration: config.duration!,
      scale: totalScaleFactor,
    });
  },
  defaults: {},
  extendTimeline: true,
});
