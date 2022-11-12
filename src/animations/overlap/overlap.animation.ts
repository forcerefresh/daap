import { createLogger } from "webslider-sdk/lib/utils/logger/logger";
import anime from "animejs";
import { IOverlapAnimation, OVERLAP_ANIMATION } from "./overlap.types";

const logger = createLogger();

export function overlapAnimation() {
  let timeline: anime.AnimeTimelineInstance;

  function init(config: IOverlapAnimation) {
    logger.debug(`${OVERLAP_ANIMATION} init`);

    timeline = anime.timeline({});
  }

  function rootStart(config: IOverlapAnimation) {
    logger.debug(`${OVERLAP_ANIMATION} rootStart`);

    timeline.seek(0);
    timeline.pause();
  }

  function rootStop(config: IOverlapAnimation) {
    logger.debug(`${OVERLAP_ANIMATION} rootStop`);
  }

  function start(config: IOverlapAnimation, isManual?: boolean) {
    logger.debug(`${OVERLAP_ANIMATION} start`);

    timeline.play();
  }

  function stop(
    config: IOverlapAnimation,
    isManual?: boolean,
    isReverse?: boolean
  ) {
    logger.debug(`${OVERLAP_ANIMATION} stop`);

    timeline.pause();
  }

  function update(config: IOverlapAnimation, time: number, isManual?: boolean) {
    logger.debug(`${OVERLAP_ANIMATION} update`);
    if (isManual) {
      timeline.seek(time);
      timeline.pause();
    }
  }

  function pause(config: IOverlapAnimation) {
    logger.debug(`${OVERLAP_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: IOverlapAnimation) {
    logger.debug(`${OVERLAP_ANIMATION} resume`);

    timeline.play();
  }

  function direction(config: IOverlapAnimation, direction: number) {
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
