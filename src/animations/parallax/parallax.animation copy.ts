import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { IParallaxAnimation, PARALLAX_ANIMATION } from "./parallax.types";

const DEPTH_MULTIPLIER = 25; // from input we get 0-100, dividing with 25 we get 0-4 multiplier
const STRENGTH_MULTIPLIER = 50; // from input we get 0-100, dividing with 50 we get 0-2 multiplier

export function parallaxAnimation() {
  let timeline: gsap.core.Timeline;

  let layer: HTMLDivElement;
  let initialPosition: { x: number; y: number }[] = [];
  let layerMouseMoveHandler: any;
  let applyParallaxToAll: any;

  let objectEls: HTMLDivElement[] = [];

  function init(config: IParallaxAnimation) {
    logger.debug(`${PARALLAX_ANIMATION} init`);

    layer = document.getElementsByClassName(
      `layer-${config.itemId}`
    )[0] as HTMLDivElement;

    console.log(layer);
    objectEls = Array.from(layer.childNodes) as HTMLDivElement[];

    objectEls.forEach((objEl, idx) => {
      initialPosition.push({
        x: parseInt(objEl.parentElement!.style.left),
        y: parseInt(objEl.parentElement!.style.top),
      });
    });

    layerMouseMoveHandler = (event: MouseEvent) => {
      console.log(event.clientY);
      var rect = (
        event?.currentTarget as HTMLDivElement
      ).getBoundingClientRect();
      var mouseX = event.clientX - rect.left; //x position within the element.
      var mouseY = event.clientY - rect.top; //y position within the element.

      const moveX = mouseX - config.objectProperties?.width! / 2;
      const moveY = mouseY - config.objectProperties?.height! / 2;

      console.log(moveY);
      applyParallaxToAll(moveX, moveY);
    };

    applyParallaxToAll = (moveX: number, moveY: number) => {
      console.log(config.parallax.objects);
      objectEls.forEach((objEl, idx) => {
        console.log(objEl);

        applyParallaxToObject(
          idx,
          objEl as HTMLElement,
          idx * 5, //object.depth,
          moveX,
          moveY
        );
      });
    };

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

    ///////
    timeline = gsap.timeline({ paused: true, duration: config.duration });
    // timeline[getMethodByType(config.type)](element, {
    //   ease: config.ease,
    //   duration: config.duration! / 1000,
    // });
  }

  function rootStart(config: any) {
    logger.debug(`${PARALLAX_ANIMATION} rootStart`);
  }

  function rootStop(config: any) {
    logger.debug(`${PARALLAX_ANIMATION} rootStop`);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${PARALLAX_ANIMATION} start`);

    layer.addEventListener("mousemove", layerMouseMoveHandler);
    timeline.play();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${PARALLAX_ANIMATION} stop`);
    layer.removeEventListener("mousemove", layerMouseMoveHandler);

    if (config.parallax.setToInitialPositionOnComplete) {
      applyParallaxToAll(0, 0);
    }

    if (isManual) {
      // goto end because we set display:none at te end of timeline
      // timeline.progress(config.duration / 1000);
    }
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug(`${PARALLAX_ANIMATION} pause`);
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${PARALLAX_ANIMATION} resume`);
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug(`${PARALLAX_ANIMATION} destroy`);

    timeline.clear();
    timeline.kill();
  }

  return {
    start,
    stop,
    init,
    update,
    pause,
    resume,
    rootStart,
    rootStop,
    destroy,
  };
}
