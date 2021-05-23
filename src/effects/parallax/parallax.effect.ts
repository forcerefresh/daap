import { Console } from "console";
import gsap, { Circ } from "gsap";
import { layers } from "../../store/reducers/layers";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { parallax, IParallaxEffect } from "./parallax.types";

gsap.registerEffect({
  name: parallax,
  effect: function (targets: any, config: IParallaxEffect) {
    console.log(targets);
    console.log(config);

    //targets[0]; //<- layer
    //"object-" + id;

    //const { id, depth } = config.parallax.objects[0];
    //const smooth = config.parallax.smooth;

    //config.parallax.autoDepth = true;
    //config.parallax.autoDepthInc = 5;

    //const autoDepthInc = config.parallax.autoDepthInc;

    //const autoDepth = config.parallax.autoDepth;
    const tl = gsap.timeline({ repeat: -1 });
    return tl.to(targets[0], {
      duration: 1.5,
      y: -200,
      ease: Circ.easeOut,
      yoyo: true,
      repeat: 1,
    });
  },

  defaults: {},
  extendTimeline: true,
});
