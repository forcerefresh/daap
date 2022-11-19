import anime from "animejs";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getLayerElementById, getObjectElementById } from "../animation-utils";
import { IParallaxAnimation, PARALLAX_ANIMATION } from "./parallax.types";

const DEPTH_MULTIPLIER = 25; // from input we get 0-100, dividing with 25 we get 0-4 multiplier
const STRENGTH_MULTIPLIER = 50; // from input we get 0-100, dividing with 50 we get 0-2 multiplier

export function parallaxAnimation() {
  let timeline: anime.AnimeInstance;
  let layer: HTMLDivElement;
  let initialPosition: { x: number; y: number }[] = [];
  let scrollElement: Element | null;
  let scrollWindow: Window | null;
  let scrollMoveHandler: any;
  let applyParallaxToAll: any;

  function init(config: IParallaxAnimation) {
    logger.animation.debug(`${PARALLAX_ANIMATION} init`);

    layer = getLayerElementById(config.itemId!);

    scrollElement = layer?.closest(".preview-scrollable-holder");
    if (!scrollElement) {
      switch (config.parallax.trigger) {
        case "window":
          scrollWindow = window;
          break;
        case "custom":
          scrollElement = document.querySelector(
            `${config.parallax.customScrollbarSelector}`
          );
          break;
      }
    }

    scrollMoveHandler = () => {
      const scrollTop = scrollElement?.scrollTop ?? scrollWindow?.scrollY ?? 0;
      const rangeFrom = 0;
      const rangeTo = 100000;
      if (scrollTop > rangeFrom && scrollTop < rangeTo) {
        applyParallaxToAll(0, -scrollTop);
      }
    };

    const objects = config.parallax.objects;
    const easing =
      !config.ease || config.ease === "none" ? "linear" : config.ease; //TODO

    objects.forEach((object, idx) => {
      const objEl = getObjectElementById(object.id);

      initialPosition.push({
        x: parseInt(objEl.parentElement!.style.left),
        y: parseInt(objEl.parentElement!.style.top),
      });
    });

    applyParallaxToAll = (moveX: number, moveY: number) => {
      objects.forEach((object, idx) => {
        if (config.parallax.depthType === "auto") {
          object.depth = (idx + 1) * config.parallax.autoDepthInc;
        }
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
      timeline = anime({
        targets: el.parentElement,
        duration: config.parallax.followTime,
        easing,
        translateY:
          (moveY * depth * config.parallax.strength) /
          STRENGTH_MULTIPLIER /
          DEPTH_MULTIPLIER,
      });
    }
  }

  function rootStart(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} rootStart`);
  }

  function rootStop(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} rootStop`);
  }

  function start(config: any, isManual?: boolean) {
    logger.animation.debug(`${PARALLAX_ANIMATION} start`);
    scrollElement?.addEventListener("scroll", scrollMoveHandler);
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.animation.debug(`${PARALLAX_ANIMATION} stop`);

    if (config.parallax.setToInitialPositionOnComplete) {
      applyParallaxToAll(0, 0);
    }

    if (isManual) {
      // goto end because we set display:none at te end of timeline
    }
    scrollElement?.removeEventListener("scroll", scrollMoveHandler);
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
    }
  }

  function pause(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} pause`);
  }

  function resume(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} resume`);
  }

  function destroy(config: any) {
    logger.animation.debug(`${PARALLAX_ANIMATION} destroy`);
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
