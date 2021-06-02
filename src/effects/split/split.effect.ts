import gsap from "gsap";
import { RGBColor } from "react-color";
import { split, ISplitEffect } from "./split.types";

function createCube(target: HTMLDivElement, peaces: number) {
  let html = `<div class="container">`;
  for (let i = 0; i < peaces; i++) {
    html += `<div class="peace peace${i + 1}"></div>`;
  }
  html += `</div>`;
  target.innerHTML += html;
}

//const areaW = 1000;
//const areaH = 500;

gsap.registerEffect({
  name: split,
  effect: function (targets: any, config: ISplitEffect) {
    const areaW = config.objectProperties?.width || 0;
    const areaH = config.objectProperties?.height || 0;

    console.log(config);

    const slideTransitionHolder = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0];

    let target: HTMLDivElement;
    if (!slideTransitionHolder) {
      target = document.createElement("div");
      target.style.position = "absolute";
      target.style.width = `${areaW}px`;
      target.style.height = `${areaH}px`;
      target.className = "slideTransitionHolder";
      //s target.style.zIndex = `${(config.nextZIndex || 0) - 2}`;

      document.getElementsByClassName("slidesHolder")[0].append(target);

      addCSS(target, config, areaW, areaH);

      createCube(target, config.split.points.length);
    } else {
      target = slideTransitionHolder as HTMLDivElement;
    }

    const tl = gsap.timeline({
      paused: true,
    });

    const move = 330;
    const ease = "power4.in";

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

      tl.add(
        gsap.to(".peace" + (i + 1), {
          scale: "+=1",
          y: vMoveSign + Math.abs(vMove / center) * 330,
          x: hMoveSign + Math.abs(hMove / center) * 330,
          rotation:
            config.rotation < 0 ? "-=" : "+=" + Math.abs(config.rotation),
          duration: config.duration!,
          ease,
        }),
        0
      );
    }

    if (config?.prevSlideEl) config.prevSlideEl.style.display = "none";

    tl.play();

    let started = false;

    tl.eventCallback("onComplete", () => {
      if (started) {
        started = false;

        const slideTransitionHolder2 = document.getElementsByClassName(
          "slideTransitionHolder"
        )[0];
        slideTransitionHolder2?.parentNode?.removeChild(slideTransitionHolder2);
      }
    });

    tl.eventCallback("onUpdate", () => {
      if (!started) {
        started = true;
      }
    });

    return tl;
  },
  defaults: {},
  extendTimeline: true,
});

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function addCSS(
  target: HTMLDivElement,
  config: ISplitEffect,
  areaW: number,
  areaH: number
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
        width: ${areaW}px;
        height: ${areaH}px;
        position:absolute;
      }
      .peace {
        position: absolute;
        width: ${areaW}px;
        height: ${areaH}px;
        overflow: hidden;
       box-shadow: 5px 10px 10px red;
      }
      ${peaces}
    </style>
 `;
}
