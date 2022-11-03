import { RGBColor } from "react-color";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { ISplitAnimation, SPLIT_ANIMATION } from "./split.types";

function createPeaces(target: HTMLDivElement, peaces: number) {
  let html = `<div class="container">`;
  for (let i = 0; i < peaces; i++) {
    html += `<div class="peace peace${i + 1}"></div>`;
  }
  html += `</div>`;
  target.innerHTML += html;
}

export function splitAnimation() {
  let timeline: gsap.core.Timeline;
  let slideTransitionHolder: HTMLDivElement | undefined;

  function init(config: ISplitAnimation) {
    logger.debug(`${SPLIT_ANIMATION} init`);

    const areaW = config.breakpointData?.width || 0;
    const areaH = config.breakpointData?.height || 0;
    const pageAreaW = config.breakpointData?.pageWidth || 0;

    slideTransitionHolder = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0] as HTMLDivElement | undefined;

    let target: HTMLDivElement;
    if (!slideTransitionHolder) {
      target = document.createElement("div");
      target.style.position = "absolute";
      target.style.width = `${areaW}px`;
      target.style.height = `${areaH}px`;
      target.className = "slideTransitionHolder";
      //s target.style.zIndex = `${(config.nextZIndex || 0) - 2}`;

      document.getElementsByClassName("slidesHolder")[0].append(target);

      addCSS(target, config, areaW, areaH, pageAreaW);

      createPeaces(target, config.split.points.length);

      slideTransitionHolder = target;
    } else {
      target = slideTransitionHolder as HTMLDivElement;
    }

    timeline = gsap.timeline({
      paused: true,
    });

    //CustomWiggle.create("myWiggle", { wiggles: 6 });
    const move = 900; // TODO
    const ease = config.ease;

    for (let i = 0; i < config.split.points.length; i++) {
      const peace = target.getElementsByClassName("peace" + (i + 1))[0];
      peace.innerHTML = config?.prevSlideEl?.innerHTML || "";

      const center = 50;
      const x2 = config.split.points[i].x;
      const y2 = config.split.points[i].y;
      const x3 =
        config.split.points[i + 1 == config.split.points.length ? 0 : i + 1].x;
      const y3 =
        config.split.points[i + 1 == config.split.points.length ? 0 : i + 1].y;

      const xMiddle = (x2 + x3) / 2;
      const yMiddle = (y2 + y3) / 2;

      const hRandom =
        config.randomStrength > 0
          ? (Math.random() * config.randomStrength) / 100
          : 0;
      const vRandom =
        config.randomStrength > 0
          ? (Math.random() * config.randomStrength) / 100
          : 0;
      const hMove = center - xMiddle + 50 * hRandom;
      const vMove = center - yMiddle + 50 * vRandom;

      const vMoveSign = vMove < 0 ? "+=" : "-=";
      const hMoveSign = hMove < 0 ? "+=" : "-=";

      timeline.add(
        gsap.to(".peace" + (i + 1), {
          scale: "+=1",
          y: vMoveSign + Math.abs(vMove / center) * move,
          x: hMoveSign + Math.abs(hMove / center) * move,
          rotation:
            config.rotation < 0 ? "-=" : "+=" + Math.abs(config.rotation),
          duration: config.duration! / 1000,
          ease,
        }),
        0
      );
    }

    if (config?.prevSlideEl) config.prevSlideEl.style.display = "none";
  }

  function rootStart(config: any) {
    logger.debug(`${SPLIT_ANIMATION} rootStart`);
  }

  function rootStop(config: any) {
    logger.debug(`${SPLIT_ANIMATION} rootStop`);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${SPLIT_ANIMATION} start`);

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${SPLIT_ANIMATION} stop`);

    const slideTransitionHolder2 = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0];
    slideTransitionHolder2?.parentNode?.removeChild(slideTransitionHolder2);
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.debug(`${SPLIT_ANIMATION} update`);
    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug(`${SPLIT_ANIMATION} pause`);
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${SPLIT_ANIMATION} resume`);
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug(`${SPLIT_ANIMATION} destroy`);

    timeline.clear();
    timeline.kill();
  }

  function direction(config: any, direction: number) {
    logger.debug(`${SPLIT_ANIMATION} reverse`);

    if (direction === -1 && !timeline.reversed()) {
      timeline.reverse();
    }
    if (direction === 1) {
      timeline.play();
    }
  }

  return {
    init,
    rootStart,
    start,
    update,
    stop,
    rootStop,
    pause,
    resume,
    destroy,
  };
}

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function addCSS(
  target: HTMLDivElement,
  config: ISplitAnimation,
  areaW: number,
  areaH: number,
  pageAreaW: number
) {
  let peaces = "";
  for (let i = 0; i < config.split.points.length; i++) {
    const x1 = config.split.center.x;
    const y1 = config.split.center.y;

    const x2 = config.split.points[i].x;
    const y2 = config.split.points[i].y;
    const x3 =
      config.split.points[i + 1 == config.split.points.length ? 0 : i + 1].x;
    const y3 =
      config.split.points[i + 1 == config.split.points.length ? 0 : i + 1].y;

    let addPoint = "";
    if ((x2 === 0 && y3 === 0) || (x3 === 0 && y2 === 0)) {
      addPoint = " 0% 0%,";
    }
    if ((x2 === 100 && y3 === 100) || (x3 === 100 && y2 === 100)) {
      addPoint = " 100% 100%,";
    }

    if ((x2 === 0 && y3 === 100) || (x3 === 0 && y2 === 100)) {
      addPoint = " 0% 100%,";
    }

    if ((x2 === 100 && y3 === 0) || (x3 === 100 && y2 === 0)) {
      addPoint = " 100% 0%,";
    }

    peaces += `
      .peace${i + 1} {
        clip-path:  polygon(${x1}% ${y1}%, ${x2}% ${y2}%,${addPoint} ${x3}% ${y3}%);
      }`;
  }

  target.innerHTML = `
    <style>
      .container {
        position: absolute;
        width: ${pageAreaW}px;
        height: ${areaH}px;
        position:absolute;
      }
      .peace {
        position: absolute;
        width: ${pageAreaW}px;
        height: ${areaH}px;
        overflow: visible;
       box-shadow: 5px 10px 10px red;
       border-left: ${(pageAreaW - areaW) / 2}px solid transparent;
        left: -${(pageAreaW - areaW) / 2}px;
      }
      ${peaces}
    </style>
 `;
}
