import { getMethodByType } from "../common";
import gsap from "gsap";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { FADE_ANIMATION, IFadeAnimation } from "./fade.types";

export function fadeAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;

  let isInitialized = false;

  function init(config: IFadeAnimation) {
    logger.debug(`${FADE_ANIMATION} init`);

    if (isInitialized) return;

    element = getObjectElementById(config.itemId!);
    // initialState.opacity = element.style.opacity;

    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](element, {
      ease: config.ease,
      duration: config.duration! / 1000,
      opacity: 0,
    });

    isInitialized = true;
  }

  function rootStart(config: any) {
    logger.debug(`${FADE_ANIMATION} rootStart`);

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
      console.log("Aaaaaaaaaaaaaa123456");
    }
  }

  function rootStop(config: any) {
    logger.debug(`${FADE_ANIMATION} rootStop`);

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
      console.log("Aaaaaaaaaaaaaa123");
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${FADE_ANIMATION} start`);

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${FADE_ANIMATION} stop`);

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
    logger.debug(`${FADE_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${FADE_ANIMATION} resume`);

    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.debug(`${FADE_ANIMATION} reverse`);

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
