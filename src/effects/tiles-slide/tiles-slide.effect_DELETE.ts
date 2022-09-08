import gsap from "gsap";
import { merge } from "lodash-es";
import {
  createTilesFromHtml,
  getMethodByType,
  getObjectContentElementAndHtml,
  tilesCompleteHandler,
  tilesStartHandler,
  updateTilesSize,
} from "../common";
import { ITilesSlideEffect, TILES_SLIDE_ANIMATION } from "./tiles-slide.types";

gsap.registerEffect({
  name: TILES_SLIDE_ANIMATION,
  effect: function (targets: any, config: ITilesSlideEffect) {
    // get element and html
    const { objectContentElement, objectContentHtml } =
      getObjectContentElementAndHtml(targets[0]);

    // create title elements
    const elements = createTilesFromHtml(
      objectContentHtml,
      {
        w: config.objectProperties?.width!,
        h: config.objectProperties?.height!,
      },
      { r: config.rows, c: config.columns }
    );

    const innerElements: HTMLDivElement[] = [];
    // append title elements
    elements.forEach((element) => {
      innerElements.push(element.firstElementChild as HTMLDivElement);
      targets[0].appendChild(element);
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

    // 1. common config
    var baseConfig = {
      ease: config.ease,
      duration: config.duration! * (config.timeDistribution! / 100),
      opacity: config.opacity / 100,
      filter: `blur(${config.blur}px)`,
      //scale: 1.1,
      //backgroundPositionX: `+=${config.axisX}px`,
      //backgroundPositionY: `+=${config.axisY}px`,
      x: `+=${config.axisX}`,
      y: `+=${config.axisY}`,
      stagger: {
        amount: config.duration! * (1 - config.timeDistribution! / 100),
        ease: config.childEase,
        grid: [config.rows, config.columns],
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

    // 2. specific config for effect variation
    const partialConfig = getParameters(
      config.rows,
      config.columns,
      config.startFrom
    );

    return gsap[getMethodByType(config.type)](
      innerElements,
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
/*
function createTiles(
  url: string,
  size: { w: number; h: number },
  grid: { r: number; c: number }
): Element[] {
  const holder = document.createElement("div");
  let html = "";
  const tilesWidth = size.w / grid.c;
  const tilesHeight = size.h / grid.r;
  for (let i = 0; i < grid.r; i++) {
    for (let j = 0; j < grid.c; j++) {
      html += `<div style="
              outline: 1px solid transparent;
              transform: translateZ(0);
							background:url('${url}'); 
							width: ${tilesWidth}px; 
							height: ${tilesHeight}px;
							position:absolute; 
							left: ${j * tilesWidth}px;
							top: ${i * tilesHeight}px;
							background-position: ${-j * tilesWidth}px ${-i * tilesHeight}px;
              background-repeat: no-repeat;
              ">
							</div>`;
    }
  }

  holder.innerHTML = html;
  return Array.from(holder.children);
}*/
