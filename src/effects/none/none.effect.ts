import gsap from "gsap";
import { INoneEffect, none } from "./none.types";

gsap.registerEffect({
  name: none,
  effect: function (targets: string | object | null, config: INoneEffect) {
    return gsap.to([], {
      duration: config.duration!,
    });
  },
  defaults: {},
  extendTimeline: true,
});
