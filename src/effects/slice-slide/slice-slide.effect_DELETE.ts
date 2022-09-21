import gsap from "gsap";
import { ISliceSlideEffect, SLICE_SLIDE_ANIMATION } from "./slice-slide.types";
import { merge } from "lodash-es";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
  updateTilesSize,
} from "../common";

gsap.registerEffect({
  name: SLICE_SLIDE_ANIMATION,
  effect: function (targets: any, config: ISliceSlideEffect) {
    // get element and html
    const { objectContentElement, objectContentHtml } =
      getObjectContentElementAndHtml(targets[0]);

    const photoGrid = { r: 1, c: 1 };

    if (config.orientation == "horizontal") {
      photoGrid.r = config.slices;
    } else {
      photoGrid.c = config.slices;
    }

    const elObserver = new ResizeObserver(sizeChangeHandler);

    function sizeChangeHandler() {
      const tileEls = targets[0].getElementsByClassName("tile");
      updateTilesSize(
        tileEls,
        { w: targets[0].offsetWidth, h: targets[0].offsetHeight },
        photoGrid
      );
    }

    // create title elements
    const elements = createTilesFromHtml(
      objectContentHtml,
      {
        w: config.objectProperties?.width!,
        h: config.objectProperties?.height!,
      },
      photoGrid
    );
    elements.forEach((element) => {
      targets[0].appendChild(element);
    });

    let isStarted = false;

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
      onComplete: () => {
        elObserver.disconnect();

        tilesCompleteHandler(config.type, objectContentElement, elements);
        isStarted = false;
      },
      onStart: () => {
        if (!isStarted) {
          elObserver.observe(targets[0]);

          tilesStartHandler(config.type, objectContentElement, elements);
          isStarted = true;
        }
      },
      onUpdate: () => {
        if (!isStarted) {
          elObserver.observe(targets[0]);

          tilesStartHandler(config.type, objectContentElement, elements);
          isStarted = true;
        }
      },
    };

    const partialConfig = getParameters(
      photoGrid.r,
      photoGrid.c,
      config.startingPoint
    );

    return gsap[getMethodByType(config.type)](
      elements,
      merge(baseConfig, partialConfig) as any
    );
  },
  defaults: {},
  extendTimeline: true,
});

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
