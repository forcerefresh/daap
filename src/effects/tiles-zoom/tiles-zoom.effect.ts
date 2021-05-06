import gsap from "gsap";
import { ITilesZoomEffect, tilesZoom } from "./tiles-zoom.types";
import { merge } from "lodash";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
} from "../common";

//console.log("REGISTER EFFECT");
gsap.registerEffect({
  name: tilesZoom,
  effect: function (targets: any, config: ITilesZoomEffect) {
    const target = targets[0];

    // get element and html
    const {
      objectContentElement,
      objectContentHtml,
    } = getObjectContentElementAndHtml(target);

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
        isStarted = false;
        tilesCompleteHandler(config.type, objectContentElement, elements);
      },
      onStart: function () {
        //console.log("---------------- onStart");
        if (!isStarted) {
          isStarted = true;
          //console.log("START onStart ************************************");
          //console.log(objectContentElement);
          tilesStartHandler(config.type, objectContentElement, elements);
          //target.style.display = "block";
        }
      },
      onUpdate: function () {
        if (!isStarted) {
          isStarted = true;
          //console.log("START  ********** onUpdate **************************");
          //console.log(objectContentElement);
          tilesStartHandler(config.type, objectContentElement, elements);
          // target.style.display = "block";
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
