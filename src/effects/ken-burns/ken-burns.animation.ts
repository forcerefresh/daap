import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { getMethodByType, getObjectContentElementAndHtml } from "../common";
import { IKenBurnsEffect } from "./ken-burns.types";

function kenBurnsAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;
  let totalScaleFactor: number;

  let objectContentElement: HTMLDivElement;

  function init(config: IKenBurnsEffect) {
    logger.debug("kenBurns init");

    // get element and html
    element = getObjectElementById(config.itemId!);
    totalScaleFactor = (config.scaleFactor * config.duration!) / 1000 / 100 + 1;
    const objectContentElementAndObjectContentHtml =
      getObjectContentElementAndHtml(element);

    objectContentElement =
      objectContentElementAndObjectContentHtml.objectContentElement;

    if (config.type === "in") {
      gsap.set(element, {
        scale: totalScaleFactor,
      });
    }

    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](element, {
      ease: config.ease,
      duration: config.duration! / 1000,
      scale: 1,
    });
  }

  function rootStart(config: any) {
    logger.debug("kenBurns rootStart");

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.debug("kenBurns rootStop");

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("kenBurns start");

    gsap.set(element, {
      transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
    });
    objectContentElement.style.visibility = "visible";
    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("kenBurns stop");

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
    logger.debug("kenBurns pause");

    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("kenBurns resume");

    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.debug("kenBurns reverse");

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

const kenBurnsDef = {
  effectId: "kenBurns",
  effectFunc: kenBurnsAnimation,
};
export default kenBurnsDef;
