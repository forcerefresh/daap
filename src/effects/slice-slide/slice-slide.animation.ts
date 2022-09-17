import { merge } from "lodash-es";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
  updateTilesSize,
} from "../common";
import { ISliceSlideEffect } from "./slice-slide.types";

function sliceSlideAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;
  let elements: HTMLDivElement[] = [];

  let objectContentElement: HTMLDivElement;
  let objectContentHtml: string;

  let elObserver: ResizeObserver;

  function init(config: ISliceSlideEffect) {
    logger.debug("sliceSlide init");

    element = getObjectElementById(config.itemId!);

    // get element and html
    const objectContentElementAndObjectContentHtml =
      getObjectContentElementAndHtml(element);

    objectContentElement =
      objectContentElementAndObjectContentHtml.objectContentElement;
    objectContentHtml =
      objectContentElementAndObjectContentHtml.objectContentHtml;

    const photoGrid = { r: 1, c: 1 };

    if (config.orientation === "horizontal") {
      photoGrid.r = config.slices;
    } else {
      photoGrid.c = config.slices;
    }

    elObserver = new ResizeObserver(sizeChangeHandler);

    function sizeChangeHandler() {
      const tileEls = element.getElementsByClassName(
        "tile"
      ) as unknown as any[];
      updateTilesSize(
        tileEls,
        { w: element.offsetWidth, h: element.offsetHeight },
        photoGrid
      );
    }

    // create title elements
    elements = createTilesFromHtml(
      objectContentHtml,
      {
        w: config.objectProperties?.width!,
        h: config.objectProperties?.height!,
      },
      photoGrid
    );
    elements.forEach((elm) => {
      element.appendChild(elm);
    });

    const xy = getXY(config.from, config.distance);
    const baseConfig = {
      ease: config.ease,
      duration: config.duration! * (config.timeDistribution! / 100),
      opacity: 0,
      x: xy.x,
      y: xy.y,
      stagger: {
        amount: config.duration! * (1 - config.timeDistribution! / 100),
        ease: config.childEase,
      },
    };

    const partialConfig = getParameters(
      photoGrid.r,
      photoGrid.c,
      config.startingPoint
    );

    ///////
    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](
      elements,
      merge(baseConfig, partialConfig) as any
    );
  }

  function rootStart(config: any) {
    logger.debug("sliceSlide rootStart");

    if (config.type === "in") {
      objectContentElement.style.visibility = "hidden";
      elements.forEach((element) => {
        element.style.visibility = "visible";
      });

      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.debug("sliceSlide rootStop");

    if (config.type === "out") {
      objectContentElement.style.visibility = "visible";
      elements.forEach((element) => {
        element.style.visibility = "hidden";
      });

      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("sliceSlide start");

    elObserver.observe(element);
    objectContentElement.style.visibility = "hidden";
    elements.forEach((element) => {
      element.style.visibility = "visible";
    });
    tilesStartHandler(config.type, objectContentElement, elements);

    //if (isManual) return;

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("sliceSlide stop");

    elObserver.disconnect();

    tilesCompleteHandler(config.type, objectContentElement, elements);
  }

  function update(config: any, time: number, isManual?: boolean) {
    elObserver.observe(element);
    tilesStartHandler(config.type, objectContentElement, elements);
  }

  function pause(config: any) {
    logger.debug("sliceSlide pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("sliceSlide resume");
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug("sliceSlide destroy");
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

const sliceSlideDef = {
  effectId: "sliceSlide",
  effectFunc: sliceSlideAnimation,
};
export default sliceSlideDef;

function getParameters(rows: number, columns: number, startFrom: string) {
  switch (startFrom) {
    case "random":
      return { stagger: { from: "random" } };
    case "center":
      return { stagger: { from: "center" } };
    case "start":
      return { stagger: { from: "start" } };
    case "end":
      return { stagger: { from: "end" } };
  }
}

function getXY(from: "top" | "bottom" | "left" | "right", distance: number) {
  const xy = { x: "+=0", y: "+=0" };
  switch (from) {
    case "top":
      xy.y = "-=" + distance;
      break;
    case "bottom":
      xy.y = "+=" + distance;
      break;
    case "left":
      xy.x = "-=" + distance;
      break;
    case "right":
      xy.x = "+=" + distance;
      break;
  }
  return xy;
}
