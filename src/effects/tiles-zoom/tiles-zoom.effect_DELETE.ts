import gsap from "gsap";
import { ITilesZoomEffect, TILES_ZOOM_ANIMATION } from "./tiles-zoom.types";
import { merge } from "lodash-es";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
  updateTilesSize,
} from "../common";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";

gsap.registerEffect({
  name: TILES_ZOOM_ANIMATION,
  effect: function (targets: any, config: ITilesZoomEffect) {
    const target = targets[0];

    // get element and html
    const { objectContentElement, objectContentHtml } =
      getObjectContentElementAndHtml(target);

    // create title elements
    const elements = createTilesFromHtml(
      objectContentHtml,
      {
        w: config.objectProperties?.width!,
        h: config.objectProperties?.height!,
      },
      { r: config.rows, c: config.columns }
    );

    // append title elements
    elements.forEach((element) => {
      target.appendChild(element);
    });

    const elObserver = new ResizeObserver(sizeChangeHandler);

    function sizeChangeHandler() {
      const tileEls = targets[0].getElementsByClassName("tile");
      updateTilesSize(
        tileEls,
        { w: targets[0].offsetWidth, h: targets[0].offsetHeight },
        { r: config.rows, c: config.columns }
      );
    }

    let isStarted = false;

    var baseConfig = {
      ease: config.ease,
      duration: config.duration! * (config.timeDistribution! / 100),
      scale: 0,
      transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
      stagger: {
        amount: config.duration! * (1 - config.timeDistribution! / 100),
        grid: [config.rows, config.columns],
        ease: config.childEase,
      },
      onComplete: function () {
        logger.add("COMPLETE");
        logger.flush();

        elObserver.disconnect();

        isStarted = false;
        tilesCompleteHandler(config.type, objectContentElement, elements);
      },
      onStart: function () {
        logger.add("START");

        if (!isStarted) {
          elObserver.observe(targets[0]);

          isStarted = true;
          tilesStartHandler(config.type, objectContentElement, elements);
        }
      },
      onUpdate: function () {
        logger.add("UPDATE");

        if (!isStarted) {
          elObserver.observe(targets[0]);

          isStarted = true;
          tilesStartHandler(config.type, objectContentElement, elements);
        }
      },
    };

    const partialConfig = getParameters(
      config.rows,
      config.columns,
      config.startFrom
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
      return {
        stagger: {
          from: "center",
        },
      };
    case "horizontal-center":
      return {
        stagger: {
          from: "center",
          axis: "y",
        },
      };
    case "vertical-center":
      return {
        stagger: {
          from: "center",
          axis: "x",
        },
      };
    case "edges":
      return { stagger: { from: "edges" } };
    case "horizontal-edges":
      return {
        stagger: {
          from: "edges",
          axis: "y",
        },
      };
    case "vertical-edges":
      return {
        stagger: {
          from: "edges",
          axis: "x",
        },
      };
    case "top-left":
      return {
        stagger: {
          from: "0",
        },
      };
    case "top-right":
      return {
        stagger: {
          from: `${columns - 1}`,
        },
      };
    case "bottom-left":
      return {
        stagger: {
          from: `${columns * (rows - 1)}`,
        },
      };
    case "bottom-right":
      return {
        stagger: {
          from: `${columns * rows - 1}`,
        },
      };
  }
}
