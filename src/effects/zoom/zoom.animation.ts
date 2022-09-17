import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { getMethodByType } from "../common";
import { IZoomInEffect } from "./zoom.types";

function zoomAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;

  function init(config: IZoomInEffect) {
    logger.debug("zoom init");

    element = getObjectElementById(config.itemId!);

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
    logger.debug("zoom rootStart");

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.debug("zoom rootStop");

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("zoom start");

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("zoom stop");

    if (isManual) {
      timeline.pause();
      if (isReverse) {
        timeline.progress(0);
      } else {
        timeline.progress(config.duration / 1000);
      }
    }
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("zoom pause");

    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("zoom resume");

    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.debug("zoom reverse");

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

const zoomDef = {
  effectId: "zoomIn",
  effectFunc: zoomAnimation,
};
export default zoomDef;
