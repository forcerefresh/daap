import { getMethodByType } from "../common";
import gsap from "gsap";
import { logger } from "webslider-sdk2/lib/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ISlideAnimation } from "./slide.types";

export function slideAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;
  const initialState = {
    transform: "",
  };

  function init(config: ISlideAnimation) {
    logger.debug("slide init");

    element = getObjectElementById(config.itemId!);
    initialState.transform = element.style.transform;

    const xy = getXY(config.from, config.distance);

    console.log(config.type);

    console.log(getMethodByType(config.type));
    console.log(xy);

    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](element, {
      ease: config.ease,
      duration: config.duration! / 1000,
      y: xy.y,
      x: xy.x,
    });
  }

  function rootStart(config: any) {
    logger.debug("slide rootStart");

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.debug("slide rootStop");

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("slide start");
    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("slide stop");

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
    logger.debug("slide pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("slide resume");
    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.debug("fade reverse");

    if (direction === -1 && !timeline.reversed()) {
      timeline.reverse();
    }
    if (direction === 1) {
      timeline.play();
    }
  }

  function getXY(
    from: "top" | "bottom" | "left" | "right",
    distance: number,
    opposite = false
  ) {
    const xy = { x: "+=0", y: "+=0" };

    const min = opposite ? "+=" : "-=";
    const plus = opposite ? "-=" : "+=";

    switch (from) {
      case "top":
        xy.y = min + distance;
        break;
      case "bottom":
        xy.y = plus + distance;
        break;
      case "left":
        xy.x = min + distance;
        break;
      case "right":
        xy.x = plus + distance;
        break;
    }
    return xy;
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
    direction,
  };
}
