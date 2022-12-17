import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectOrLayerElementById } from "../animation-utils";
import { getMethodByType } from "../common";
import { IZoomInAnimation, ZOOM_ANIMATION } from "./zoom.types";
import gsap from "gsap";

export function zoomAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;

  function init(config: IZoomInAnimation) {
    logger.animation.debug(`${ZOOM_ANIMATION} init`);

    element = getObjectOrLayerElementById(config.itemId!);

    timeline = gsap.timeline({ paused: true });
    if (config.type === "in") {
      timeline.fromTo(
        element,
        { scaleX: 0, scaleY: 0 },
        {
          ease: config.ease,
          duration: config.duration! / 1000,
          scaleX: config.scaleX / 100,
          scaleY: config.scaleY / 100,
        }
      );
    } else {
      timeline[getMethodByType(config.type)](element, {
        ease: config.ease,
        duration: config.duration! / 1000,
        opacity: 0,
        scaleX: 0,
        scaleY: 0,
      });
    }
  }

  function rootStart(config: any) {
    logger.animation.debug(`${ZOOM_ANIMATION} rootStart`);

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.animation.debug(`${ZOOM_ANIMATION} rootStop`);

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.animation.debug(`${ZOOM_ANIMATION} start`);

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.animation.debug(`${ZOOM_ANIMATION} stop`);

    if (isManual) {
      timeline.pause();
      if (isReverse) {
        timeline.progress(0);
      } else {
        timeline.progress(1);
      }
    }
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.animation.debug(`${ZOOM_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: any) {
    logger.animation.debug(`${ZOOM_ANIMATION} resume`);

    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.animation.debug(`${ZOOM_ANIMATION} reverse`);

    if (direction === -1 && !timeline.reversed()) {
      timeline.reverse();
    }
    if (direction === 1) {
      timeline.play();
    }
  }

  return {
    init,
    rootStart,
    start,
    update,
    stop,
    rootStop,
    pause,
    resume,
    direction,
  };
}
