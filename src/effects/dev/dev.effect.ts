import gsap from "gsap";
import { IDevEffect, dev } from "./dev.types";
import trianglify from "trianglify";

gsap.registerEffect({
  name: dev,
  effect: function (targets: any, config: IDevEffect) {
    const objectEl = targets[0] as HTMLElement;

    // ****
    const pattern = trianglify({
      width: 600,
      height: 400,
    }) as any;
    objectEl.appendChild(pattern.toSVG());

    // ****

    return gsap.to([], {
      duration: config.duration!,
    });
  },
  defaults: {},
  extendTimeline: true,
});
