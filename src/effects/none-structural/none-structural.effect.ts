import gsap from "gsap";
import { INoneStructuralEffect, noneStructural } from "./none-structural.types";

gsap.registerEffect({
  name: noneStructural,
  effect: function (
    targets: string | object | null,
    config: INoneStructuralEffect
  ) {
    return gsap.to([], {
      duration: config.duration!,
    });
  },
  defaults: {},
  extendTimeline: true,
});
