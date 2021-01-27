import gsap from "gsap";
import { tilesFade, ITilesFadeEffect } from "./tiles-fade.types";

gsap.registerEffect({
  name: tilesFade,
  effect: function (targets: any, config: ITilesFadeEffect) {
    gsap.set(targets, {
      column: config.column,
      row: config.row,
      transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
    });
    const url = "http://macloo.com/images/inidisini/domba/IMG_4507.jpg";
    const size = { w: 600, h: 366 };
    const photoGrid = { r: config.row, c: config.column };

    const elements = createTiles(url, size, photoGrid);

    elements.forEach((element) => {
      targets[0].appendChild(element);
    });

    const pointOfView = getParameters(
      config.duration!,
      config.transformOrigin.x,
      config.transformOrigin.y,
      config.row,
      config.column,
      config.pointOfView
    );

    console.log(pointOfView, "petar");

    return gsap.from(elements, { ...(pointOfView as any) });
  },
  defaults: {},
  extendTimeline: true,
});

function getParameters(
  duration: number,
  transformx: number,
  transformy: number,
  row: number,
  column: number,
  pointOfView: string
) {
  var root = {
    duration: duration / 2,
    ease: "power1.inOut",
    transformOrigin: `${transformx}% ${transformy}%`,
    stagger: {
      amount: duration / 2,
    },
    autoAlpha: 0,
  };

  switch (pointOfView) {
    case "random":
      const randomValue = {
        ...root,
        stagger: {
          ...root.stagger,
          from: "random",
        },
			};
			root = randomValue;
      break;
    case "center":
      const centerValue = {
        ...root,
        stagger: {
          ...root.stagger,
          from: "center",
        },
			};
			root = centerValue;
      break;
    case "horizontal-center":
      const horizontalCenterValue = {
        ...root,
        stagger: {
          ...root.stagger,
          from: "center",
          axis: "y",
        },
			};
			root = horizontalCenterValue;
      break;
    case "vertical-center":
      const verticalCenterValue = {
        ...root,
        stagger: {
          ...root.stagger,
          from: "center",
          axis: "x",
        },
			};
			root = verticalCenterValue;
      break;
  }
  return root;
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
