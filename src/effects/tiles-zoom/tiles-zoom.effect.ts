import gsap from "gsap";
import { ITilesZoomEffect, tilesZoom } from "./tiles-zoom.types";
import { merge } from "lodash";

gsap.registerEffect({
  name: tilesZoom,
  effect: function (targets: any, config: ITilesZoomEffect) {
    // cemu sluzi funkcija set?
    //gsap.set(targets, {
    //column: config.columns, /// << cemu sluzi ovo ?
    //row: config.rows, /// << cemu sluzi ovo ?
    // transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`, /// << cemu sluzi ovo?
    //});

    // TODO: remove hardcoded
    const url = "/images/Machu_Picchu.jpg";
    const size = { w: 1024, h: 768 };
    const photoGrid = { r: config.rows, c: config.columns };

    const elements = createTiles(url, size, photoGrid);

    // clean
    targets[0].innerHTML = "";

    elements.forEach((element) => {
      targets[0].appendChild(element);
    });

    console.log(config);
    // 1. common config
    var baseConfig = {
      ease: config.ease,
      duration: config.duration! * (config.timeDistribution! / 100),
      scale: 0,
      transformZ: 0,
      transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
      stagger: {
        amount: config.duration! * (1 - config.timeDistribution! / 100),
        grid: [config.rows, config.columns],
        ease: config.childEase,
      },
    };

    // 2. specific config for effect variation
    const partialConfig = getParameters(
      config.rows,
      config.columns,
      config.startFrom
    );

    // 3. merge common and specific config
    return gsap.from(elements, merge(baseConfig, partialConfig) as any);
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
								background-position: ${-j * tilesWidth}px ${-i * tilesHeight}px;">
								</div>`;
    }
  }

  holder.innerHTML = html;
  return Array.from(holder.children);
}
