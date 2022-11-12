import { createLogger } from "webslider-sdk/lib/utils/logger/logger";
import anime from "animejs";
import { FADE_SLIDE_ANIMATION, IFadeSlideAnimation } from "./fade-slide.types";

const logger = createLogger();

export function fadeSlideAnimation() {
  let timeline: anime.AnimeTimelineInstance;

  function init(config: IFadeSlideAnimation) {
    logger.debug(`${FADE_SLIDE_ANIMATION} init`);

    const easing =
      !config.ease || config.ease === "none" ? "linear" : config.ease; //TODO

    timeline = anime.timeline({});

    timeline.add({
      duration: config.duration!,
      easing,
      targets: config.nextSlideEl,
      opacity: [0, 1],
    });
  }

  function rootStart(config: IFadeSlideAnimation) {
    logger.debug(`${FADE_SLIDE_ANIMATION} rootStart`);

    timeline.seek(0);
    timeline.pause();
  }

  function rootStop(config: IFadeSlideAnimation) {
    logger.debug(`${FADE_SLIDE_ANIMATION} rootStop`);
  }

  function start(config: IFadeSlideAnimation, isManual?: boolean) {
    logger.debug(`${FADE_SLIDE_ANIMATION} start`);

    config.nextSlideEl!.style.zIndex = `${config.nextZIndex}`;
    timeline.play();
  }

  function stop(
    config: IFadeSlideAnimation,
    isManual?: boolean,
    isReverse?: boolean
  ) {
    logger.debug(`${FADE_SLIDE_ANIMATION} stop`);

    timeline.pause();
  }

  function update(
    config: IFadeSlideAnimation,
    time: number,
    isManual?: boolean
  ) {
    logger.debug(`${FADE_SLIDE_ANIMATION} update`);
    if (isManual) {
      timeline.seek(time);
      timeline.pause();
    }
  }

  function pause(config: IFadeSlideAnimation) {
    logger.debug(`${FADE_SLIDE_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: IFadeSlideAnimation) {
    logger.debug(`${FADE_SLIDE_ANIMATION} resume`);

    timeline.play();
  }

  function direction(config: IFadeSlideAnimation, direction: number) {
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
