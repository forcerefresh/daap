import gsap from "gsap";
import { ISliceSlideEffect, sliceSlide } from "./slice-slide.types";
import { merge } from "lodash";

gsap.registerEffect({
  name: sliceSlide,
  effect: function (targets: any, config: ISliceSlideEffect) {
    const url = "/images/Machu_Picchu.jpg";
    const size = { w: 1024, h: 768 };
    var photoGrid = { r: 1, c: 1 };

    if (config.orientation == "horizontal") {
      photoGrid = { r: config.slices, c: 1 };
    } else {
      photoGrid = { r: 1, c: config.slices };
    }

    const elements = createTiles(url, size, photoGrid);
    const xy = getXY(config.from, config.distance);

    elements.forEach((element) => {
      targets[0].appendChild(element);
    });

    var baseConfig = {
      ease: config.ease,
      duration: config.duration! / 2,
      opacity: 0,
      x: xy.x,
      y: xy.y,
      stagger: {
        amount: config.duration! / 2,
        ease: "none",
      },
    };

    const partialConfig = getParameters(
      photoGrid.r,
      photoGrid.c,
      config.startingPoint
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
