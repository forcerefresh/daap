import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getLayerElementById, getObjectElementById } from "../animation-utils";
import { IParallaxAnimation, PARALLAX_ANIMATION } from "./parallax.types";

const DEPTH_MULTIPLIER = 25; // from input we get 0-100, dividing with 25 we get 0-4 multiplier
const STRENGTH_MULTIPLIER = 50; // from input we get 0-100, dividing with 50 we get 0-2 multiplier

export function parallaxAnimation() {
  let timeline: gsap.core.Timeline;

  let layer: HTMLDivElement;
  let initialPosition: { x: number; y: number }[] = [];
  let layerMouseMoveHandler: any;
  let applyParallaxToAll: any;

  function init(config: IParallaxAnimation) {
    logger.animation.debug(`${PARALLAX_ANIMATION} init`);

    layer = getLayerElementById(config.itemId!);

    const scrollElement = layer?.closest(".preview-scrollable-holder");
    console.log(scrollElement);

    scrollElement?.addEventListener("scroll", () => {
      console.log(scrollElement.scrollTop);
      applyParallaxToAll(0, -scrollElement.scrollTop);
    });

    // layer = document.getElementsByClassName("layer")[0] as HTMLDivElement;
    config.parallax.objects.forEach((object, idx) => {
      const objEl = getObjectElementById(object.id);

      initialPosition.push({
        x: parseInt(objEl.parentElement!.style.left),
        y: parseInt(objEl.parentElement!.style.top),
      });
    });

    layerMouseMoveHandler = (event: MouseEvent) => {
      var rect = (
        event?.currentTarget as HTMLDivElement
      ).getBoundingClientRect();
      var mouseX = event.clientX - rect.left; //x position within the element.
      var mouseY = event.clientY - rect.top; //y position within the element.

      const moveX = mouseX - config.objectProperties?.width! / 2;
      const moveY = mouseY - config.objectProperties?.height! / 2;

      applyParallaxToAll(moveX, moveY);
    };

    applyParallaxToAll = (moveX: number, moveY: number) => {
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
        y:
          (moveY * depth * config.parallax.strength) /
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
    logger.animation.debug(`${PARALLAX_ANIMATION} rootStart`);
  }

  function rootStop(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} rootStop`);
  }

  function start(config: any, isManual?: boolean) {
    logger.animation.debug(`${PARALLAX_ANIMATION} start`);

    layer.addEventListener("mousemove", layerMouseMoveHandler);
    timeline.play();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.animation.debug(`${PARALLAX_ANIMATION} stop`);
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
    logger.animation.debug(`${PARALLAX_ANIMATION} pause`);
    timeline.pause();
  }

  function resume(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} resume`);
    timeline.resume();
  }

  function destroy(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} destroy`);

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
