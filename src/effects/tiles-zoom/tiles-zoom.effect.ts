import gsap from "gsap";
import { ITilesZoomEffect, tilesZoom } from "./tiles-zoom.types";
import * as _ from "lodash";

gsap.registerEffect({
  name: tilesZoom,
  effect: function (targets: any, config: ITilesZoomEffect) {
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

    const conf = getParameters(config.row, config.column, config.pointOfView);

    var effectConfiguration = {
      duration: config.duration! / 2,
      scale: 0,
      ease: "power1.inOut",
      transformOrigin: `${config.transformOrigin.x}% ${config.transformOrigin.y}%`,
      ...conf.root,
      stagger: {
        amount: config.duration! / 2,
        grid: [config.row, config.column],
        ease: "none",
        ...conf.root.stagger,
      },
    };

    return gsap.from(elements, { ...(effectConfiguration as any) });
  },
  defaults: {},
  extendTimeline: true,
});

function getParameters(row: number, column: number, pointOfView: string) {
  var conf = {
    root: {
      stagger: {
        from: "",
        axis: "",
      },
    },
  };

  switch (pointOfView) {
    case "random":
      conf.root.stagger = _.merge(conf.root.stagger, { from: "random" });
      break;
    case "horizontal-center":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: "center",
        axis: "y",
      });
      break;
    case "vertical-center":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: "center",
        axis: "x",
      });
      break;
    case "edges":
      conf.root.stagger = _.merge(conf.root.stagger, { from: "edges" });
      break;
    case "horizontal-edges":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: "edges",
        axis: "y",
      });
      break;
    case "vertical-edges":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: "edges",
        axis: "x",
      });
      break;
    case "top-left":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: "0",
      });
      break;
    case "top-right":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: `${column - 1}`,
      });
      break;
    case "bottom-left":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: `${column * (row - 1)}`,
      });
      break;
    case "bottom-right":
      conf.root.stagger = _.merge(conf.root.stagger, {
        from: `${column * row - 1}`,
      });
      break;
  }
  return conf;
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
