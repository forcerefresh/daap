import {
  relativePosition2Gsap,
  relativeRotation2Gsap,
} from "../../inputs/cast-utils";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ITimelinesEffect } from "./timelines.types";

function timelinesAnimation() {
  let timeline: gsap.core.Timeline;
  let objectEl: HTMLElement;

  function init(config: ITimelinesEffect) {
    logger.debug("timelines init");

    objectEl = getObjectElementById(config.itemId!);
    timeline = gsap.timeline();

    for (let j = 0; j < config.timelines.timelines.length; j++) {
      const tlTl = gsap.timeline();
      timeline.add(tlTl, 0);
      const points = config.timelines.timelines[j].points;

      sortPoints(points);
      let currentTime = 0;
      let startFrom = 0;
      for (let i = 0; i < points.length; i++) {
        const { time, pointValue, easing } = points[i];
        const cssValue = {
          ...(pointValue.x.enabled
            ? { x: relativePosition2Gsap(pointValue.x) }
            : {}),
          ...(pointValue.y.enabled
            ? { y: relativePosition2Gsap(pointValue.y) }
            : {}),
          ...(pointValue.width.enabled
            ? { width: relativePosition2Gsap(pointValue.width) }
            : {}),
          ...(pointValue.height.enabled
            ? { height: relativePosition2Gsap(pointValue.height) }
            : {}),
          ...(pointValue.rotation.enabled
            ? { rotation: relativeRotation2Gsap(pointValue.rotation) }
            : {}),
          ...(pointValue.opacity.enabled
            ? {
                opacity: relativePosition2Gsap({
                  ...pointValue.opacity,
                  value: pointValue.opacity.value / 100,
                }),
              }
            : {}),
          ...(pointValue.zoom.enabled
            ? {
                scale: relativePosition2Gsap({
                  ...pointValue.zoom,
                  value: pointValue.zoom.value / 100,
                }),
              }
            : {}),
        };
        const dur = (config.duration! / 1000) * (time / 100) - currentTime;
        currentTime = dur;
        tlTl.add(
          gsap.from(objectEl, { duration: dur, css: cssValue, ease: easing }),
          startFrom
        );
        startFrom += dur;
      }
    }
  }

  function rootStart(config: any) {
    logger.debug("timelines rootStart");

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.debug("timelines rootStop");

    timeline.pause();
    timeline.progress(0);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("timelines start");

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("timelines stop");

    //timeline.pause();
    //timeline.progress(config.duration / 1000);
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.debug("timelines update");

    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("timelines pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("timelines resume");
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug("timelines destroy");
    timeline.clear();
    timeline.kill();
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
    destroy,
  };
}

const timelinesDef = {
  effectId: "timelinesEffect",
  effectFunc: timelinesAnimation,
};
export default timelinesDef;

function sortPoints(points: any[]) {
  points.sort((a, b) => {
    return a.time > b.time ? 1 : -1;
  });
}
