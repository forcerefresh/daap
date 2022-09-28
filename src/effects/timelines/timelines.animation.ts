import {
  relativePosition2Gsap,
  relativeRotation2Gsap,
} from "../../inputs/cast-utils";
import { convertTimeUnitToMs } from "../../webslider-sdk/src/objects/object-utils";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ITimelinesEffect } from "./timelines.types";
import anime from "animejs";
import { ITimelinePoint } from "../../webslider-sdk/src/inputs/i-inputs";

function getTranslateX(fromPoint: ITimelinePoint, toPoint: ITimelinePoint) {
  const { time: fromTime, pointValue: fromPointValue } = fromPoint;
  const { time: toTime, pointValue: toPointValue } = toPoint;

  let timelineDuration =
    convertTimeUnitToMs(toTime) - convertTimeUnitToMs(fromTime);
  let translateX: any;
  if (fromPointValue.x.enabled && toPointValue.x.enabled) {
    translateX = [
      relativePosition2Gsap(fromPointValue.x),
      relativePosition2Gsap(toPointValue.x),
    ];
  }

  if (!fromPointValue.x.enabled && toPointValue.x.enabled) {
    translateX = relativePosition2Gsap(toPointValue.x);
  }

  if (fromPointValue.x.enabled && !toPointValue.x.enabled) {
    translateX = relativePosition2Gsap(fromPointValue.x);
    timelineDuration = 1;
  }

  return { timelineDuration, translateX };
}

function getTranslateY(fromPoint: ITimelinePoint, toPoint: ITimelinePoint) {
  const { time: fromTime, pointValue: fromPointValue } = fromPoint;
  const { time: toTime, pointValue: toPointValue } = toPoint;

  let timelineDuration =
    convertTimeUnitToMs(toTime) - convertTimeUnitToMs(fromTime);
  let translateY: any;
  if (fromPointValue.y.enabled && toPointValue.y.enabled) {
    translateY = [
      relativePosition2Gsap(fromPointValue.y),
      relativePosition2Gsap(toPointValue.y),
    ];
  }

  if (!fromPointValue.y.enabled && toPointValue.y.enabled) {
    translateY = relativePosition2Gsap(toPointValue.y);
  }

  if (fromPointValue.y.enabled && !toPointValue.y.enabled) {
    translateY = relativePosition2Gsap(fromPointValue.y);
    timelineDuration = 1;
  }

  return { timelineDuration, translateY };
}
export function timelinesAnimation() {
  let timeline: anime.AnimeTimelineInstance;
  let objectEl: HTMLElement;

  function init(config: ITimelinesEffect) {
    logger.debug("timelines init");

    objectEl = getObjectElementById(config.itemId!);

    timeline = anime.timeline({
      easing: "linear", // TODO
    });

    const cssProps: any = {};
    for (let j = 0; j < config.timelines.timelines.length; j++) {
      const fromPoint = config.timelines.timelines[j].first;
      const toPoint = config.timelines.timelines[j].last;

      const { time: fromTime, pointValue: fromPointValue } = fromPoint;
      const { time: toTime, pointValue: toPointValue } = toPoint;

      const { timelineDuration: timelineDuration1, translateX } = getTranslateX(
        fromPoint,
        toPoint
      );

      const { timelineDuration: timelineDuration2, translateY } = getTranslateY(
        fromPoint,
        toPoint
      );

      //const cssValue = {
      // ...(pointValue.y.enabled
      //   ? { y: relativePosition2Gsap(pointValue.y) }
      //   : {}),
      // ...(pointValue.width.enabled
      //   ? { width: relativePosition2Gsap(pointValue.width) }
      //   : {}),
      // ...(pointValue.height.enabled
      //   ? { height: relativePosition2Gsap(pointValue.height) }
      //   : {}),
      // ...(pointValue.rotation.enabled
      //   ? { rotation: relativeRotation2Gsap(pointValue.rotation) }
      //   : {}),
      // ...(pointValue.opacity.enabled
      //   ? {
      //       opacity: relativePosition2Gsap({
      //         ...pointValue.opacity,
      //         value: pointValue.opacity.value / 100,
      //       }),
      //     }
      //   : {}),
      // ...(pointValue.zoom.enabled
      //   ? {
      //       scale: relativePosition2Gsap({
      //         ...pointValue.zoom,
      //         value: pointValue.zoom.value / 100,
      //       }),
      //     }
      //   : {}),
      //};

      console.log(translateX);
      console.log(translateY);

      if (translateX) {
        // cssProps.translateX = {
        //   value: translateX,
        //   duration: timelineDuration1,
        //   delay: fromTime,
        // };
        console.log("ADD TL");
        console.log(translateX);
        timeline.add(
          {
            targets: objectEl,
            duration: timelineDuration1,
            translateX: translateX,
          },
          convertTimeUnitToMs(fromTime)
        );
      }
      if (translateY) {
        // cssProps.translateY = {
        //   value: translateY,
        //   duration: timelineDuration2,
        //   delay: fromTime,
        // };
        console.log("ADD TL");
        console.log(translateY);

        timeline.add(
          {
            targets: objectEl,
            duration: timelineDuration2,
            translateY: translateY,
          },
          convertTimeUnitToMs(fromTime)
        );
      }
    }

    // timeline.add({
    //   targets: objectEl,
    //   ...cssProps,
    // });

    // convertTimeUnitToMs(fromTime)
  }

  function rootStart(config: any) {
    logger.debug("timelines rootStart");

    timeline.pause();
  }

  function rootStop(config: any) {
    logger.debug("timelines rootStop");

    timeline.pause();
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("timelines start");

    timeline.play();
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
    //timeline.resume();
  }

  function destroy(config: any) {
    logger.debug("timelines destroy");
    //timeline.clear();
    //timeline.kill();
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
