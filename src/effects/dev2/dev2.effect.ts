import gsap from "gsap";
import { IDev2Effect, dev2 } from "./dev2.types";
import trianglify from "trianglify";

gsap.registerEffect({
  name: dev2,
  effect: function (targets: any, config: IDev2Effect) {
    const objectEl = targets[0] as HTMLElement;

    const pattern = trianglify({
      width: 600,
      height: 400,
    }) as any;
    objectEl.appendChild(pattern.toSVG());

    return gsap.to([], {
      duration: config.duration!,
    });
  },
  defaults: {},
  extendTimeline: true,
});
