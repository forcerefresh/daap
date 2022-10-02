import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import anime from "animejs";
import { FADE_SLIDE_ANIMATION, IFadeSlideEffect } from "./fade-slide.types";

export function fadeSlideAnimation() {
  let timeline: anime.AnimeTimelineInstance;

  function init(config: IFadeSlideEffect) {
    logger.debug(`${FADE_SLIDE_ANIMATION} init`);

    timeline = anime.timeline({
      targets: config.nextSlideEl,
      duration: config.duration! / 1000,
      opacity: 0,
    });
  }

  function rootStart(config: any) {
    logger.debug(`${FADE_SLIDE_ANIMATION} rootStart`);

    timeline.seek(0);
    timeline.pause();
  }

  function rootStop(config: any) {
    logger.debug(`${FADE_SLIDE_ANIMATION} rootStop`);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${FADE_SLIDE_ANIMATION} start`);

    timeline.play();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${FADE_SLIDE_ANIMATION} stop`);

    timeline.pause();
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.debug(`${FADE_SLIDE_ANIMATION} update`);
    if (isManual) {
      timeline.seek(time);
      timeline.pause();
    }
  }

  function pause(config: any) {
    logger.debug(`${FADE_SLIDE_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${FADE_SLIDE_ANIMATION} resume`);

    timeline.play();
  }

  function direction(config: any, direction: number) {
    logger.debug(`${FADE_SLIDE_ANIMATION} reverse`);
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
