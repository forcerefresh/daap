import { createLogger } from "webslider-sdk/lib/utils/logger/logger";
import anime from "animejs";
import {
  ISlideSlideAnimation,
  SLIDE_SLIDE_ANIMATION,
} from "./slide-slide.types";

const logger = createLogger();

export function slideSlideAnimation() {
  let timeline: anime.AnimeTimelineInstance;
  let stageW = 1000; // TODO change with slide W
  let stageH = 500; // TODO change with slide H

  function init(config: ISlideSlideAnimation) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} init`);

    const xy = getXY(config.from, config.distance);

    const easing =
      !config.ease || config.ease === "none" ? "linear" : config.ease; //TODO

    timeline = anime.timeline({});

    timeline.add({
      duration: config.duration!,
      easing,
      targets: config.nextSlideEl,
      translateX: [unitValueToPx(xy.x, stageW), 0],
      translateY: [unitValueToPx(xy.y, stageH), 0],
    });
  }

  function rootStart(config: ISlideSlideAnimation) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} rootStart`);

    timeline.seek(0);
    timeline.pause();
  }

  function rootStop(config: ISlideSlideAnimation) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} rootStop`);
  }

  function start(
    config: ISlideSlideAnimation,
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
    config: ISlideSlideAnimation,
    isManual?: boolean,
    isReverse?: boolean
  ) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} stop`);
    console.log(timeline.currentTime, "srki");
    console.log(Date.now(), "srki");

    // NOTE: we are not pausing as Timeline call stop before timeline ends
    // timeline.pause();
  }

  function update(
    config: ISlideSlideAnimation,
    time: number,
    isManual?: boolean
  ) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} update`);
    if (isManual) {
      timeline.seek(time);
      timeline.pause();
    }
  }

  function pause(config: ISlideSlideAnimation) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: ISlideSlideAnimation) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} resume`);

    timeline.play();
  }

  function direction(config: ISlideSlideAnimation, direction: number) {
    logger.debug(`${SLIDE_SLIDE_ANIMATION} reverse`);
  }

  function getXY(from: "top" | "bottom" | "left" | "right", distance: string) {
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

  function unitValueToPx(value: string, hundredPercentValue: number) {
    if (value.indexOf("px") !== -1) {
      return parseFloat(value);
    } else if (value.indexOf("%") !== -1) {
      return (hundredPercentValue * parseFloat(value)) / 100;
    }

    // this is not needed
    parseFloat(value);
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
