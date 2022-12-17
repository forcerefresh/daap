import { getMethodByType } from "../common";
import gsap from "gsap";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectOrLayerElementById } from "../animation-utils";
import { ISlideAnimation } from "./slide.types";

export function slideAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;
  const initialState = {
    transform: "",
  };

  function init(config: ISlideAnimation) {
    logger.animation.debug("slide init");

    element = getObjectOrLayerElementById(config.itemId!);
    initialState.transform = element.style.transform;

    const xy = getXY(config.from, config.distance);

    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](element, {
      ease: config.ease,
      duration: config.duration! / 1000,
      y: xy.y,
      x: xy.x,
    });
  }

  function rootStart(config: any) {
    logger.animation.debug("slide rootStart");

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.animation.debug("slide rootStop");

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.animation.debug("slide start");
    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.animation.debug("slide stop");

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
    logger.animation.debug("slide pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.animation.debug("slide resume");
    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.animation.debug("fade reverse");

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
