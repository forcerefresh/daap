import { getMethodByType } from "../common";
import gsap from "gsap";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { IFadeEffect } from "./fade.types";

function fadeAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;

  function init(config: IFadeEffect) {
    logger.debug("fade init");

    element = getObjectElementById(config.itemId!);
    // initialState.opacity = element.style.opacity;

    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](element, {
      ease: config.ease,
      duration: config.duration! / 1000,
      opacity: 0,
    });
  }

  function rootStart(config: any) {
    logger.debug("fade rootStart");

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.debug("fade rootStop");

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  /*
  function rootStart(config: any) {
    logger.debug("fade rootStart");
    if (config.type === "in") element.style.opacity = "0";
  }

  function rootStop(config: any) {
    logger.debug("fade rootStop");
    if (config.type === "out") element.style.opacity = "1";
  }*/

  function start(config: any, isManual?: boolean) {
    logger.debug("fade start");

    //element.style.opacity = config.type === "in" ? "0" : "1"; //initialState.opacity;

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("fade stop");

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
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("fade pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("fade resume");
    timeline.resume();
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
  };
}

const fadeDef = {
  effectId: "fade",
  effectFunc: fadeAnimation,
};
export default fadeDef;
