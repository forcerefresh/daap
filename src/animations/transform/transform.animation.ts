import { convertTimeUnitToMs } from "webslider-sdk/lib/objects/object-utils";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ITransformAnimation } from "./transform.types";
import anime from "animejs";

function getPointValue(property: string, value: string | number | any) {
  switch (property) {
    case "translateX":
    case "translateY":
    case "translateZ":
      return parseInt(value.value);

    case "scaleX":
    case "scaleY":
    case "scaleZ":
      return parseInt(value) === 0 ? 0 : parseInt(value) / 100;

    case "rotateX":
    case "rotateY":
    case "rotateZ":
      return value;

    case "opacity":
      return parseInt(value) === 0 ? 0 : parseInt(value) / 100;

    default:
      return undefined;
  }
}

export function transformAnimation() {
  let timeline: anime.AnimeTimelineInstance;
  let objectEl: HTMLElement;

  function init(config: ITransformAnimation) {
    logger.debug("timelines init");

    objectEl = getObjectElementById(config.itemId!);

    timeline = anime.timeline({
      easing: "linear", // TODO
    });

    const propsConfig: any = {};
    for (let j = 0; j < config.transform.timelines.length; j++) {
      const tl = config.transform.timelines[j];

      const pointsArr: {
        value: number | undefined;
        duration: number;
        easing: string;
      }[] = [];

      sortPoints(tl.points);

      let latestTime = 0;
      tl.points.forEach((point) => {
        pointsArr.push({
          value: getPointValue(tl.property, point.pointValue),
          duration: convertTimeUnitToMs(point.time) - latestTime,
          easing: !tl.ease || tl.ease === "none" ? "linear" : tl.ease,
        });
        latestTime = convertTimeUnitToMs(point.time);
      });

      propsConfig[tl.property] = pointsArr;
    }

    timeline.add({
      targets: objectEl,
      ...propsConfig,
    });
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
  }

  function update(config: any, time: number, isManual?: boolean) {
    //logger.debug("timelines update");

    if (isManual) {
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("timelines pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("timelines resume");
  }

  function destroy(config: any) {
    logger.debug("timelines destroy");
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

const transformDef = {
  animationId: "transform-animation",
  animationFunc: transformAnimation,
};
export default transformDef;

function sortPoints(points: any[]) {
  points.sort((a, b) => {
    return convertTimeUnitToMs(a.time) > convertTimeUnitToMs(b.time) ? 1 : -1;
  });
}
