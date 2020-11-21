import gsap from "gsap";
import { fadeIn, IFadeInEffect } from "./fade-in.types";

gsap.registerEffect({
  name: fadeIn,
  effect: function (targets: string | object | null, config: IFadeInEffect) {
    console.log(config);
    gsap.set(targets, { opacity: config.fromOpacity / 100 });
    console.log(config);
    return gsap.to(targets, {
      duration: config.duration!,
      opacity: config.toOpacity / 100,
    });
  },
  defaults: {
    /*duration: 8 */
  },
  extendTimeline: true,
});
