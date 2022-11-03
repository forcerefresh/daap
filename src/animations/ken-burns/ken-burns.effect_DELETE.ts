import gsap from "gsap";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { IKenBurnsAnimation, KEN_BURNS_ANIMATION } from "./ken-burns.types";

gsap.registerEffect({
  name: KEN_BURNS_ANIMATION,
  effect: function (targets: any, config: IKenBurnsAnimation) {
    // get element
    const { objectContentElement } = getObjectContentElementAndHtml(targets[0]);

    // scale factor are increasing through the time
    const totalScaleFactor = (config.scaleFactor * config.duration!) / 100 + 1;

    if (config.type === "in") {
      gsap.set(targets, {
        scale: totalScaleFactor,
      });
    }

    return gsap[getMethodByType(config.type)](targets, {
      ease: config.ease,
      duration: config.duration!,
      scale: 1,
      onStart: () => {
        gsap.set(targets, {
          transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
        });
        objectContentElement.style.visibility = "visible";
      },
      onInit: () => {},
    });
  },
  defaults: {},
  extendTimeline: true,
});
