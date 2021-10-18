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
        trianglifyEl = document.createElement("div");
        trianglifyEl.className = "trianglify";
        trianglifyEl.style.position = "absolute";
        trianglifyEl.style.top = "0";
        trianglifyEl.style.left = "0";
        objectEl.appendChild(trianglifyEl);
      }

      const pattern = trianglify({
        width: config.objectProperties?.width,
        height: config.objectProperties?.height,
        cellSize: config.cellSize,
        variance: config.variance / 100,
        seed: config.seed,
        xColors: config.colors.map(colorToString),
        yColors: config.colors.map(colorToString),
        fill: config.fill,
        strokeWidth: config.strokeWidth,
      } as any) as any;

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
