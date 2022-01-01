import gsap from "gsap";
import { getObjectContentElementAndHtml } from "../common";
import { ISlideEffect, slide } from "./slide.types";

gsap.registerEffect({
  name: slide,
  effect: function (targets: any, config: ISlideEffect) {
    console.log(config);
    // get element
    const { objectContentElement } = getObjectContentElementAndHtml(targets[0]);

    const xy = getXY(config.from, config.distance);

    const effectMethod = config.type === "in" ? "from" : "to";
    return gsap[effectMethod](targets, {
      ease: config.ease,
      duration: config.duration!,
      y: xy.y,
      x: xy.x,
      onComplete: () => {
        if (config.type === "in") {
          objectContentElement.style.visibility = "visible";
        }
      },
      onStart: () => {
        objectContentElement.style.visibility = "visible";
      },
    });
  },
  defaults: {},
  extendTimeline: true,
});

function getXY(from: "top" | "bottom" | "left" | "right", distance: number) {
  const xy = { x: "+=0", y: "+=0" };
  switch (from) {
    case "top":
      xy.y = "-=" + distance;
      break;
    case "bottom":
      xy.y = "+=" + distance;
      break;
    case "left":
      xy.x = "-=" + distance;
      break;
    case "right":
      xy.x = "+=" + distance;
      break;
  }
  return xy;
}
