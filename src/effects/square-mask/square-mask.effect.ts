import gsap from "gsap";
import { ISquareMaskEffect, squareMask } from "./square-mask.types";

gsap.registerEffect({
  name: squareMask,
  effect: function (targets: any, config: ISquareMaskEffect) {
    const rootTimeline = gsap.timeline();

    const initializeEffect = () => {
      const objectEl = targets[0]! as HTMLElement;
			const photo = objectEl.firstChild;

      var borderEl = document.createElement("div");
      borderEl.style.position = "absolute";
      borderEl.style.top = "0";
      borderEl.style.left = "0";
      borderEl.style.borderStyle = "solid";
      borderEl.style.borderWidth = "0px";
      borderEl.style.borderColor = "aqua";
      borderEl.style.width = "300px";
      borderEl.style.height = "300px";
      targets[0].appendChild(borderEl);

      rootTimeline.to(borderEl, {
				duration: config.duration!,
				ease: config.ease!,
				borderTopWidth: config.borderTop,
				borderBottomWidth: config.borderBottom,
				borderLeftWidth: config.borderLeft,
				borderRightWidth: config.borderRight,
      });
    };

    let isStarted = false;
    rootTimeline.eventCallback("onStart", () => {
      if (!isStarted) {
        initializeEffect();
        isStarted = true;
      }
    });

    rootTimeline.eventCallback("onUpdate", () => {
      if (!isStarted) {
        initializeEffect();
        isStarted = true;
      }
    });

    rootTimeline.eventCallback("onComplete", () => {
      console.log("onComplete");
      if (isStarted) {
        isStarted = false;
      }
    });

    return rootTimeline;
  },
  defaults: {},
  extendTimeline: true,
});
