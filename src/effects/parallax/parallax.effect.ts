import { Console } from "console";
import gsap from "gsap";
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
    return gsap.to(targets, {
      ease: config.ease,
      duration: 5,
      x: "-=100",
      opacity: 0.3,
      repeat: 1000,
    });
  },

  defaults: {},
  extendTimeline: true,
});
