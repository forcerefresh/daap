import gsap from "gsap";
import { tilesFade, ITilesFadeEffect } from "./tiles-fade.types";
import { merge } from "lodash";

gsap.registerEffect({
  name: tilesFade,
  effect: function (targets: any, config: ITilesFadeEffect) {
    const url = "http://macloo.com/images/inidisini/domba/IMG_4507.jpg";
    const size = { w: 600, h: 366 };
    const photoGrid = { r: config.rows, c: config.columns };

    const elements = createTiles(url, size, photoGrid);

    elements.forEach((element) => {
      targets[0].appendChild(element);
    });

    var baseConfig = {
      duration: config.duration! / 2,
      ease: "power1.in",
      opacity: 0,
      stagger: {
        amount: config.duration! / 2,
        grid: [config.rows, config.columns],
        ease: "none",
      },
    };

    const partialConfig = getParameters(
      config.rows,
      config.columns,
      config.startFrom
    );

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
