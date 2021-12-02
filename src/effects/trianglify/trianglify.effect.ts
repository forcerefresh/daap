import gsap from "gsap/all";
import { RGBColor } from "react-color";
import trianglify from "trianglify";
import { ITrianglifyEffect, trianglifyPhoto } from "./trianglify.types";

gsap.registerEffect({
  name: trianglifyPhoto,
  effect: function (targets: any, config: ITrianglifyEffect) {
    const objectEl = targets[0] as HTMLElement;
    let trianglifyEl: HTMLElement;
    let started: boolean;

    const initializeEffect = () => {
      trianglifyEl = objectEl.getElementsByClassName(
        "trianglify"
      )[0] as HTMLElement;

      if (trianglifyEl === undefined) {
        if (config.strokeColorSG == "color") {
          const trianglifyStyle = document.createElement("style");
          trianglifyStyle.innerHTML = `
        .trianglify > svg > path {
          stroke: ${colorToString(config.strokeColor)};
        }
        `;
          objectEl.appendChild(trianglifyStyle);
        }
        trianglifyEl = document.createElement("div");
        trianglifyEl.className = "trianglify";
        trianglifyEl.style.position = "absolute";
        trianglifyEl.style.top = "0";
        trianglifyEl.style.left = "0";
        objectEl.appendChild(trianglifyEl);
      }

      const trConfig = {
        width: config.objectProperties?.width,
        height: config.objectProperties?.height,
        cellSize: config.cellSize,
        variance: config.variance / 100,
        seed: config.seed,
        xColors: config.colorsX.map(colorToString),
        yColors: config.colorsY.map(colorToString),
        fill: true, //config.fill,
        strokeWidth: config.strokeWidth,
        //colorSpace: "hsi",
        colorFunction: (trianglify as any).colorFunctions.interpolateLinear(
          0.5
        ),
      };

      if (config.colorsSG === "match") {
        trConfig.xColors = config.colors.map(colorToString);
        trConfig.yColors = "match" as any;
      } /*else if (config.colorsSG === "random") {
        trConfig.xColors = "random" as any;
        trConfig.yColors = "random" as any;
        delete (trConfig as any).seed;
      }*/

      const pattern = trianglify(trConfig as any) as any;

      trianglifyEl.appendChild(pattern.toSVG());
    };

    const rootTimeline = gsap.timeline({
      duration: config.duration!,
    });

    rootTimeline.eventCallback("onComplete", () => {
      if (started) {
        trianglifyEl.parentElement?.removeChild(trianglifyEl);
        started = false;
      }
    });

    rootTimeline.eventCallback("onStart", () => {
      if (!started) {
        initializeEffect();
        started = true;
      }
    });

    rootTimeline.eventCallback("onUpdate", () => {
      if (!started) {
        initializeEffect();
        started = true;
      }
    });

    return rootTimeline;
  },
  defaults: {},
  extendTimeline: true,
});

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
