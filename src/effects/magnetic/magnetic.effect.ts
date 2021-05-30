import gsap from "gsap";
import { magnetic, IMagneticEffect } from "./magnetic.types";

const STRENGTH_MULTIPLIER = 50;

gsap.registerEffect({
  name: magnetic,
  effect: function (targets: any, config: IMagneticEffect) {
    const objectEl = targets[0] as HTMLDivElement;

    function layerMouseMoveHandler(event: MouseEvent) {
      var rect = (
        event?.currentTarget as HTMLDivElement
      ).getBoundingClientRect();
      var mouseX = event.clientX - rect.left; //x position within the element.
      var mouseY = event.clientY - rect.top; //y position within the element.

      const moveX = mouseX - config.objectProperties?.width! / 2;
      const moveY = mouseY - config.objectProperties?.height! / 2;

      applyParallaxToObject(objectEl, moveX, moveY);
    }

    function layerMouseLeaveHandler(event: MouseEvent) {
      applyParallaxToObject(objectEl, 0, 0);
    }

    function applyParallaxToObject(
      el: HTMLElement,
      moveX: number,
      moveY: number
    ) {
      gsap.to(el.parentElement!, {
        ease: config.ease,
        scale: moveX == 0 && moveY === 0 ? 1 : 1.1,
        duration: config.followTime / 1000,
        x: (moveX * config.strengthX) / STRENGTH_MULTIPLIER,
        y: (moveY * config.strengthY) / STRENGTH_MULTIPLIER,
      });
    }

    const tl = gsap.timeline({ duration: config.duration! });

    let isStarted = false;
    tl.eventCallback("onStart", () => {
      if (!isStarted) {
        console.log("onStart");
        objectEl.addEventListener("mousemove", layerMouseMoveHandler);
        objectEl.addEventListener("mouseleave", layerMouseLeaveHandler);

        isStarted = true;
      }
    });

    tl.eventCallback("onComplete", () => {
      console.log("onComplete");

      objectEl.removeEventListener("mousemove", layerMouseMoveHandler);
      objectEl.removeEventListener("mouseleave", layerMouseLeaveHandler);

      if (config.setToInitialPositionOnComplete) {
        applyParallaxToObject(objectEl, 0, 0);
      }
      isStarted = false;
    });

    return tl;
  },

  defaults: {},
  extendTimeline: true,
});
