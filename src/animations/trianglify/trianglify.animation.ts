import { RGBColor } from "react-color";
import { logger } from "webslider-sdk2/lib/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ITrianglifyAnimation, TRIANGLIFY_ANIMATION } from "./trianglify.types";
import trianglify from "trianglify";

export function trianglifyAnimation() {
  let timeline: gsap.core.Timeline;
  let objectEl: HTMLElement;
  let trianglifyEl: HTMLElement;

  function init(config: ITrianglifyAnimation) {
    logger.debug(`${TRIANGLIFY_ANIMATION} init`);

    objectEl = getObjectElementById(config.itemId!);

    timeline = gsap.timeline({ duration: config.duration! / 1000 });
  }

  function rootStart(config: any) {
    logger.debug(`${TRIANGLIFY_ANIMATION} rootStart`);

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.debug(`${TRIANGLIFY_ANIMATION} rootStop`);

    timeline.pause();
    timeline.progress(0);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${TRIANGLIFY_ANIMATION} start`);

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
      colorFunction: (trianglify as any).colorFunctions.interpolateLinear(0.5),
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

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${TRIANGLIFY_ANIMATION} stop`);

    trianglifyEl.parentElement?.removeChild(trianglifyEl);
    //timeline.pause();
    //timeline.progress(config.duration / 1000);
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.debug(`${TRIANGLIFY_ANIMATION} update`);

    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug(`${TRIANGLIFY_ANIMATION} pause`);
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${TRIANGLIFY_ANIMATION} resume`);
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug(`${TRIANGLIFY_ANIMATION} destroy`);
    timeline.clear();
    timeline.kill();
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
    destroy,
  };
}

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
