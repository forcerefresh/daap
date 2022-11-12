import { merge } from "lodash-es";
import { createLogger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
  updateTilesSize,
} from "../common";
import {
  ISliceSlideAnimation,
  SLICE_SLIDE_ANIMATION,
} from "./slice-slide.types";

const logger = createLogger();

export function sliceSlideAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;
  let elements: HTMLDivElement[] = [];

  let objectContentElement: HTMLDivElement;
  let objectContentHtml: string;

  let elObserver: ResizeObserver;

  function init(config: ISliceSlideAnimation) {
    logger.debug(`${SLICE_SLIDE_ANIMATION} init`);

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
      duration: (config.duration! / 1000) * (config.timeDistribution! / 100),
      opacity: 0,
      x: xy.x,
      y: xy.y,
      stagger: {
        amount:
          (config.duration! / 1000) * (1 - config.timeDistribution! / 100),
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
    logger.debug(`${SLICE_SLIDE_ANIMATION} rootStart`);

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.debug(`${SLICE_SLIDE_ANIMATION} rootStop`);

    timeline.pause();
    timeline.progress(0);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${SLICE_SLIDE_ANIMATION} start`);

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
    logger.debug(`${SLICE_SLIDE_ANIMATION} stop`);

    elObserver.disconnect();

    tilesCompleteHandler(config.type, objectContentElement, elements);
  }

  function update(config: any, time: number, isManual?: boolean) {
    elObserver.observe(element);
    tilesStartHandler(config.type, objectContentElement, elements);
  }

  function pause(config: any) {
    logger.debug(`${SLICE_SLIDE_ANIMATION} pause`);
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${SLICE_SLIDE_ANIMATION} resume`);
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug(`${SLICE_SLIDE_ANIMATION} destroy`);
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
