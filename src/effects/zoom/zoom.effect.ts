import gsap from "gsap";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { IZoomInEffect, zoomIn } from "./zoom.types";

gsap.registerEffect({
  name: zoomIn,
  effect: function (targets: any, config: IZoomInEffect) {
    // get element
    const { objectContentElement } = getObjectContentElementAndHtml(targets[0]);

    return gsap[getMethodByType(config.type)](targets, {
      ease: config.ease,
      duration: config.duration!,
      scaleX: 0,
      scaleY: 0,
      /*onComplete: () => {
        if (config.type === "in") {
          objectContentElement.style.visibility = "visible";
        }
      },
      onStart: () => {
        objectContentElement.style.visibility = "visible";
      },*/
    });
  },
  defaults: {},
  extendTimeline: true,
});
