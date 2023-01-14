import { convertTimeUnitToMs } from "webslider-sdk/lib/objects/object-utils";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import {
  getAnimationElementById,
  getObjectElementById,
} from "../animation-utils";
import { ITransformAnimation, TRANSFORM_ANIMATION } from "./transform.types";
import anime from "animejs";

function getPointValue(property: string, value: string | number | any) {
  switch (property) {
    case "width":
    case "height":
      return "+=" + parseInt(value.value); /// + "px";
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
  let objectAnimationEl: HTMLElement;
  let objectEl: HTMLElement;
  let objectContentEl: HTMLElement;

  // /let originalSize: { width: string; height: string } | undefined;

  function init(config: ITransformAnimation) {
    logger.animation.debug("timelines init");

    objectAnimationEl = getAnimationElementById(
      config.itemId!,
      TRANSFORM_ANIMATION
    );
    objectEl = getObjectElementById(config.itemId!);
    objectContentEl = objectEl.firstChild as HTMLElement;
  }

  function rootStart(config: any) {
    logger.animation.debug("timelines rootStart");

    //timeline.pause();
  }

  function rootStop(config: any) {
    logger.animation.debug("timelines rootStop");

    timeline.pause();
  }

  function start(config: any, isManual?: boolean) {
    logger.animation.debug("timelines start");

    timeline = anime.timeline({
      easing: "linear", // TODO
    });

    const propsConfig: any = {};
    const propsConfigForObjectContent: any = {};
    for (let j = 0; j < config.transform.timelines.length; j++) {
      const tl = config.transform.timelines[j];

      const pointsArr: {
        value: number | undefined;
        duration: number;
        easing: string;
      }[] = [];

      sortPoints(tl.points);

      let latestTime = 0;
      tl.points.forEach((point: any) => {
        pointsArr.push({
          value: getPointValue(tl.property, point.pointValue),
          duration: convertTimeUnitToMs(point.time) - latestTime,
          easing: !tl.ease || tl.ease === "none" ? "linear" : tl.ease,
        });
        latestTime = convertTimeUnitToMs(point.time);
      });

      if (tl.property === "width" || tl.property === "height") {
        //   originalSize = {
        //     width: objectContentEl.style.width,
        //     height: objectContentEl.style.height,
        //   };
        propsConfigForObjectContent[tl.property] = pointsArr;
      } else {
        propsConfig[tl.property] = pointsArr;
      }
    }

    timeline.add(
      {
        targets: [objectAnimationEl],
        ...propsConfig,
      },
      0
    );
    timeline.add(
      {
        targets: [objectContentEl],
        ...propsConfigForObjectContent,
      },
      0
    );

    timeline.play();
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.animation.debug("timelines stop QWE");
    timeline.pause();
    timeline.seek(0);
    timeline.restart();

    anime.remove(objectContentEl);
    anime.remove(objectAnimationEl);

    // if (objectContentEl && originalSize) {
    //   objectContentEl.style.width = originalSize.width;
    //   objectContentEl.style.height = originalSize.height;
    // }
  }

  function update(config: any, time: number, isManual?: boolean) {
    //logger.animation.debug("timelines update");

    if (isManual) {
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.animation.debug("timelines pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.animation.debug("timelines resume");
  }

  function destroy(config: any) {
    logger.animation.debug("timelines destroy");
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
