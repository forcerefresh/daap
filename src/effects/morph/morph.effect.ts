import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { morph, IFadeEffect } from "./morph.types";
gsap.registerPlugin(MorphSVGPlugin);

gsap.registerEffect({
  name: morph,
  effect: function (targets: any, config: IFadeEffect) {
    const shape = document.querySelector("#thumb");
    const tl = gsap.timeline();
    tl.add(gsap.to(shape, { morphSVG: "#rocket", fill: "red", duration: 2 }));
    tl.add(gsap.to(shape, { morphSVG: "#apple", fill: "yellow", duration: 2 }));
    tl.add(gsap.to(shape, { morphSVG: "#heart", fill: "orange", duration: 2 }));
    tl.add(gsap.to(shape, { morphSVG: "#plug", fill: "blue", duration: 2 }));
    tl.add(gsap.to(shape, { morphSVG: "#light", fill: "green", duration: 2 }));
    tl.add(gsap.to(shape, { morphSVG: "#star", fill: "gray", duration: 2 }));

    return tl;
  },

  defaults: {},
  extendTimeline: true,
});
