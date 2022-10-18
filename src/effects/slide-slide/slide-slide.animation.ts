import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import anime from "animejs";
import { ISlideSlideEffect, SLIDE_SLIDE_ANIMATION } from "./slide-slide.types";

export function slideSlideAnimation() {
  let timeline: anime.AnimeTimelineInstance;

  function init(config: ISlideSlideEffect) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} init`);

    const xy = getXY(config.from, config.distance);

    const easing =
      !config.ease || config.ease === "none" ? "linear" : config.ease; //TODO

    timeline = anime.timeline({});

    timeline.add({
      duration: config.duration!,
      easing,
      targets: config.nextSlideEl,
      translateX: [xy.x, 0],
      translateY: [xy.y, 0],
    });
  }

  function rootStart(config: ISlideSlideEffect) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} rootStart`);

    timeline.seek(0);
    timeline.pause();
  }

  function rootStop(config: ISlideSlideEffect) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} rootStop`);
  }

  function start(
    config: ISlideSlideEffect,
    isManual?: boolean,
    timeCorrection = 0
  ) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} start`);
    console.log(Date.now(), "srki");
    config.nextSlideEl!.style.zIndex = `${config.nextZIndex}`;

    //debugger;
    if (timeCorrection > 0) {
      timeline.seek(timeCorrection);
    }
    timeline.play();
    console.log(Date.now(), "srki");
    console.log(timeline.currentTime, "srki");
  }

  function stop(
    config: ISlideSlideEffect,
    isManual?: boolean,
    isReverse?: boolean
  ) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} stop`);
    console.log(timeline.currentTime, "srki");
    console.log(Date.now(), "srki");

    // NOTE: we are not pausing as Timeline call stop before timeline ends
    // timeline.pause();
  }

  function update(config: ISlideSlideEffect, time: number, isManual?: boolean) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} update`);
    if (isManual) {
      timeline.seek(time);
      timeline.pause();
    }
  }

  function pause(config: ISlideSlideEffect) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: ISlideSlideEffect) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} resume`);

    timeline.play();
  }

  function direction(config: ISlideSlideEffect, direction: number) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} reverse`);
  }

  function getXY(from: "top" | "bottom" | "left" | "right", distance: number) {
    const xy = { x: "0", y: "0" };

    switch (from) {
      case "top":
        xy.y = "-" + distance;
        break;
      case "bottom":
        xy.y = "+" + distance;
        break;
      case "left":
        xy.x = "-" + distance;
        break;
      case "right":
        xy.x = "+" + distance;
        break;
    }
    return xy;
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
