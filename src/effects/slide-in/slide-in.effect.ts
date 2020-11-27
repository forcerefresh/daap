import gsap from "gsap";
import { ISlideInEffect, slideIn } from "./slide-in.types";

gsap.registerEffect({
  name: slideIn,
  effect: function (targets: string | object | null, config: ISlideInEffect) {
    const xy = getXY(config.from, config.distance);

    console.log(config);
    return gsap.from(targets, {
      duration: config.duration!,
      y: xy.y,
      x: xy.x,
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
