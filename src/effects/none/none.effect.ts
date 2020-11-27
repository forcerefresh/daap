import gsap from "gsap";
import { INoneEffect, none } from "./none.types";

gsap.registerEffect({
  name: none,
  effect: function (targets: string | object | null, config: INoneEffect) {},
  defaults: {},
  extendTimeline: true,
});
