import gsap from "gsap";
import { tilesFade, ITilesFadeEffect } from "./tiles-fade.types";
import { merge } from "lodash";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
} from "../common";

gsap.registerEffect({
  name: tilesFade,
  effect: function (targets: any, config: ITilesFadeEffect) {
    // get element and html
    const {
      objectContentElement,
      objectContentHtml,
    } = getObjectContentElementAndHtml(targets[0]);

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
      targets[0].appendChild(element);
    });

    let isStarted = false;

    var baseConfig = {
      ease: config.ease,
      duration: config.duration! * (config.timeDistribution! / 100),
      opacity: 0,
      stagger: {
        amount: config.duration! * (1 - config.timeDistribution! / 100),
        grid: [config.rows, config.columns],
        ease: config.childEase,
      },
      onComplete: () => {
        tilesCompleteHandler(config.type, objectContentElement, elements);
        isStarted = false;
      },
      onStart: () => {
        if (!isStarted) {
          tilesStartHandler(config.type, objectContentElement, elements);
          isStarted = true;
        }
      },
      onUpdate: () => {
        if (!isStarted) {
          tilesStartHandler(config.type, objectContentElement, elements);
          isStarted = true;
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
