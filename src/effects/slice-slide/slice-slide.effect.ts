import gsap from "gsap";
import { ISliceSlideEffect, sliceSlide } from "./slice-slide.types";
import { merge } from "lodash";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
} from "../common";

gsap.registerEffect({
  name: sliceSlide,
  effect: function (targets: any, config: ISliceSlideEffect) {
    // get element and html
    const {
      objectContentElement,
      objectContentHtml,
    } = getObjectContentElementAndHtml(targets[0]);

    const photoGrid = { r: 1, c: 1 };

    if (config.orientation == "horizontal") {
      photoGrid.r = config.slices;
    } else {
      photoGrid.c = config.slices;
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
        tilesCompleteHandler(config.type, objectContentElement, elements);
      },
      onStart: () => {
        tilesStartHandler(config.type, objectContentElement, elements);
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
