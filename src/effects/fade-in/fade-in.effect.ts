import gsap from "gsap";
import { fadeIn, IFadeInEffect } from "./fade-in.types";

gsap.registerEffect({
  name: fadeIn,
  effect: function (targets: string | object | null, config: IFadeInEffect) {
    gsap.set(targets, { opacity: config.fromOpacity / 100 });

    return gsap.to(targets, {
      ease: config.ease,
      duration: config.duration!,
      opacity: config.toOpacity / 100,
    });
  },
  defaults: {},
  extendTimeline: true,
});
