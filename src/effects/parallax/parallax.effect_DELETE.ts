import gsap from "gsap";
import { IParallaxEffect, PARALLAX_ANIMATION } from "./parallax.types";

const DEPTH_MULTIPLIER = 25; // from input we get 0-100, dividing with 25 we get 0-4 multiplier
const STRENGTH_MULTIPLIER = 50; // from input we get 0-100, dividing with 50 we get 0-2 multiplier

gsap.registerEffect({
  name: PARALLAX_ANIMATION,
  effect: function (targets: any, config: IParallaxEffect) {
    const layer = targets[0] as HTMLDivElement;

    const initialPosition: { x: number; y: number }[] = [];
    config.parallax.objects.forEach((object, idx) => {
      const objEl = document.getElementsByClassName(
        "object-" + object.id
      )[0] as HTMLElement;

      initialPosition.push({
        x: parseInt(objEl.parentElement!.style.left),
        y: parseInt(objEl.parentElement!.style.top),
      });
    });

    function layerMouseMoveHandler(event: MouseEvent) {
      var rect = (
        event?.currentTarget as HTMLDivElement
      ).getBoundingClientRect();
      var mouseX = event.clientX - rect.left; //x position within the element.
      var mouseY = event.clientY - rect.top; //y position within the element.

      const moveX = mouseX - config.objectProperties?.width! / 2;
      const moveY = mouseY - config.objectProperties?.height! / 2;

      applyParallaxToAll(moveX, moveY);
    }

    function applyParallaxToAll(moveX: number, moveY: number) {
      config.parallax.objects.forEach((object, idx) => {
        const objEl = document.getElementsByClassName("object-" + object.id);
        applyParallaxToObject(
          idx,
          objEl[0] as HTMLElement,
          object.depth,
          moveX,
          moveY
        );
      });
    }

    function applyParallaxToObject(
      idx: number,
      el: HTMLElement,
      depth: number,
      moveX: number,
      moveY: number
    ) {
      gsap.to(el.parentElement!, {
        ease: config.ease,
        duration: config.parallax.followTime / 1000,
        x:
          (moveX * depth * config.parallax.strengthX) /
          STRENGTH_MULTIPLIER /
          DEPTH_MULTIPLIER,
        y:
          (moveY * depth * config.parallax.strengthY) /
          STRENGTH_MULTIPLIER /
          DEPTH_MULTIPLIER,
      });
    }

    const tl = gsap.timeline({ duration: config.duration! });

    let isStarted = false;
    tl.eventCallback("onStart", () => {
      if (!isStarted) {
        layer.addEventListener("mousemove", layerMouseMoveHandler);
        isStarted = true;
      }
    });

    tl.eventCallback("onComplete", () => {
      layer.removeEventListener("mousemove", layerMouseMoveHandler);

      if (config.parallax.setToInitialPositionOnComplete) {
        applyParallaxToAll(0, 0);
      }
      isStarted = false;
    });

    return tl;
  },

  defaults: {},
  extendTimeline: true,
});
