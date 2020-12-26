import gsap from "gsap";
import { IKenBurnsEffect, kenBurns } from "./ken-burns.types";

gsap.registerEffect({
  name: kenBurns,
  effect: function (targets: string | object | null, config: IKenBurnsEffect) {
    console.log(arguments);
    // TODO
  },
  defaults: {},
  extendTimeline: true,
});
