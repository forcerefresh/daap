import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import anime from "animejs";
import { IOverlapEffect, OVERLAP_ANIMATION } from "./overlap.types";

export function overlapAnimation() {
  let timeline: anime.AnimeTimelineInstance;

  function init(config: IOverlapEffect) {
    logger.debug(`${OVERLAP_ANIMATION} init`);

    timeline = anime.timeline({
      duration: config.duration! / 1000,
    });
  }

  function rootStart(config: any) {
    logger.debug(`${OVERLAP_ANIMATION} rootStart`);

    timeline.seek(0);
    timeline.pause();
  }

  function rootStop(config: any) {
    logger.debug(`${OVERLAP_ANIMATION} rootStop`);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${OVERLAP_ANIMATION} start`);

    timeline.play();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${OVERLAP_ANIMATION} stop`);

    timeline.pause();
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.debug(`${OVERLAP_ANIMATION} update`);
    if (isManual) {
      timeline.seek(time);
      timeline.pause();
    }
  }

  function pause(config: any) {
    logger.debug(`${OVERLAP_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${OVERLAP_ANIMATION} resume`);

    timeline.play();
  }

  function direction(config: any, direction: number) {
    logger.debug(`${OVERLAP_ANIMATION} reverse`);
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
