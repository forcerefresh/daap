import gsap from "gsap";
import {
  INoneStructuralAnimation,
  noneStructural,
} from "./none-structural.types";

gsap.registerEffect({
  name: noneStructural,
  effect: function (
    targets: string | object | null,
    config: INoneStructuralAnimation
  ) {
    return gsap.to([], {
      duration: config.duration!,
    });
  },
  defaults: {},
  extendTimeline: true,
});
