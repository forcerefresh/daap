import gsap from "gsap";
import { INoneAnimation, none } from "./none.types";

gsap.registerEffect({
  name: none,
  effect: function (targets: string | object | null, config: INoneAnimation) {
    return gsap.to([], {
      duration: config.duration!,
    });
  },
  defaults: {},
  extendTimeline: true,
});
