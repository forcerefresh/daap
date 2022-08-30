import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  updateTilesSize,
} from "../common";
import gsap from "gsap";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ITilesZoomEffect } from "./tiles-zoom.types";
import { merge } from "lodash-es";

function tilesZoomAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;

  let objectContentElement: HTMLDivElement;
  let objectContentHtml: string;
  let elements: HTMLDivElement[];

  let elObserver: ResizeObserver;

  function init(config: ITilesZoomEffect) {
    logger.debug("tilesZoom init");

    element = getObjectElementById(config.itemId!);

    ///////

    const target = element;

    // get element and html
    const objectContentElementAndObjectContentHtml =
      getObjectContentElementAndHtml(target);

    objectContentElement =
      objectContentElementAndObjectContentHtml.objectContentElement;
    objectContentHtml =
      objectContentElementAndObjectContentHtml.objectContentHtml;

    // create title elements
    elements = createTilesFromHtml(
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

    elObserver = new ResizeObserver(sizeChangeHandler);

    function sizeChangeHandler() {
      const tileEls = target.getElementsByClassName("tile") as unknown as any[];
      updateTilesSize(
        tileEls,
        { w: target.offsetWidth, h: target.offsetHeight },
        { r: config.rows, c: config.columns }
      );
    }

    var baseConfig = {
      ease: config.ease,
      duration: (config.duration! / 1000) * (config.timeDistribution! / 100),
      scale: 0,
      transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
      stagger: {
        amount:
          (config.duration! / 1000) * (1 - config.timeDistribution! / 100),
        grid: [config.rows, config.columns],
        ease: config.childEase,
      },
    };

    const partialConfig = getParameters(
      config.rows,
      config.columns,
      config.startFrom
    );

    ///////
    timeline = gsap.timeline({ paused: true });
    timeline[getMethodByType(config.type)](
      elements,
      merge(baseConfig, partialConfig) as any
    );
  }

  function rootStart(config: any) {
    logger.debug("tilesZoom rootStart");

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
    logger.debug("tilesZoom rootStop");

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
    logger.debug("tilesZoom start");

    elObserver.observe(element);

    //if (isManual) return;

    objectContentElement.style.visibility = "hidden";
    elements.forEach((element) => {
      element.style.visibility = "visible";
    });

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("tilesZoom stop");
    logger.debug(isManual);
    logger.debug(isReverse);

    elObserver.disconnect();

    if (isManual) {
      if (isReverse) {
        timeline.pause();
        timeline.progress(0);
        objectContentElement.style.visibility =
          config.type === "in" ? "hidden" : "visible";
        elements.forEach((element) => {
          element.style.visibility =
            config.type === "in" ? "visible" : "hidden";
        });
        return; // RETURN!!!
      }

      //timeline.pause();
      //timeline.progress(config.duration / 1000);
    }

    if (config.type === "in") {
      objectContentElement.style.visibility = "visible";
    }
    elements.forEach((element) => {
      element.style.visibility = "hidden";
    });
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("tilesZoom pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("tilesZoom resume");
    timeline.resume();
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
  };
}

const tilesZoomDef = {
  effectId: "tilesZoom",
  effectFunc: tilesZoomAnimation,
};
export default tilesZoomDef;

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
