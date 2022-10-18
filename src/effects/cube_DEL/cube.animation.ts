import { getMethodByType } from "../common";
import gsap from "gsap";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { ICubeEffect } from "./cube.types";
import { RGBColor } from "react-color";

let areaW = 1000;
let areaH = 500;
let ratio = areaH / areaW;
let moveP2 = (areaW - areaH) / 2;
let moveP2ForZet = (areaW - areaH) / 2;
const moveP = ratio * areaH;

function createCube(target: HTMLDivElement) {
  target.innerHTML += `
    <div class="container">
      <div class="cube">
          <div class="face front"></div>
          <div class="face right"></div>
          <div class="face back"></div>
          <div class="face left"></div>
          <div class="face front"></div>
          <div class="face bottom"></div>
      </div>
    </div>
  `;
}

let perc = 0.75;

function cubeAnimation() {
  let timeline: gsap.core.Timeline;
  let slideTransitionHolder: HTMLDivElement | undefined;

  function init(config: ICubeEffect) {
    logger.debug("cube init");
    debugger;

    areaW = config.breakpointData?.width || 0;
    areaH = config.breakpointData?.height || 0;
    ratio = areaH / areaW;
    moveP2 = areaH / 2; //(areaW - areaH) / 2;
    moveP2ForZet = (areaW - areaH) / 2;

    perc = 0.65;
    //perc = 0.575;
    perc = 1;
    perc = 0.5; //areaW
    perc = 0.75; // areaW*2

    slideTransitionHolder = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0] as HTMLDivElement | undefined;

    if (!slideTransitionHolder) {
      slideTransitionHolder = document.createElement("div");
      slideTransitionHolder.style.position = "absolute";
      slideTransitionHolder.style.width = `${areaW}px`;
      slideTransitionHolder.style.height = `${areaH}px`;
      slideTransitionHolder.className = "slideTransitionHolder";
      slideTransitionHolder.style.zIndex = "100";

      document
        .getElementsByClassName("slidesHolder")[0]
        .append(slideTransitionHolder);

      addCSS(slideTransitionHolder, config);
      createCube(slideTransitionHolder);
    }

    const nextElObjectContent = config?.nextSlideEl?.getElementsByClassName(
      "object-content"
    )[0] as HTMLDivElement | undefined;
    if (nextElObjectContent?.style?.display) {
      nextElObjectContent.style.display = "none";
    }

    const prevElObjectContent = config?.prevSlideEl?.getElementsByClassName(
      "object-content"
    )[0] as HTMLDivElement | undefined;
    if (prevElObjectContent?.style?.display) {
      prevElObjectContent.style.display = "none";
    }

    let rots = [
      { ry: 0, rx: 0, image: "/images/1.jpg", slide: config.prevSlideEl }, // 1
      { ry: 90, rx: 0, image: "/images/2.jpg" }, // 2
      { ry: 180, rx: 0, image: "/images/3.jpg" }, // 3
      { ry: 270, rx: 0, image: "/images/4.jpg" }, // 4
      { ry: 0, rx: 90, image: "/images/2.jpg" }, // 5
      { ry: 0, rx: -90, image: "/images/4.jpg", slide: config.nextSlideEl }, // 6
    ];

    gsap.set(".face", {
      // apply transform rotations to each face of the cube
      rotateY: (i) => rots[i].ry,
      rotateX: (i) => rots[i].rx,
      transformOrigin: `50% 50% -${moveP2}px`,
      z: moveP2,
      backgroundSize: "100% 100%",
      backgroundImage: (i) =>
        !rots[i].image ? "url(" + rots[i].image + ")" : "",
    });

    const cube = slideTransitionHolder.getElementsByClassName("cube")[0];

    timeline = gsap.timeline({
      paused: true,
    });
    // timeline = tl;

    //tl.to(cube, { rotateX: 0, rotateY: -90, duration: 1 });
    //tl.to(cube, { rotateX: 0, rotateY: -180, duration: 1 });
    //tl.to(cube, { rotateX: 0, rotateY: -270, duration: 1 });
    //tl.to(cube, { rotateX: -90, rotateY: -360, duration: 1 });
    //tl.to(cube, { rotateX: 90, rotateY: -360, duration: 1 });
    timeline.to(".container", {
      scale: 0.5,
      duration: config.duration! / 3 / 1000,
    });
    //tl.to(cube, { scaleX: 0.6, scaleY: 0.6, scaleZ: 0.6, duration: 1 }); // short rotation back to 1
    timeline.to(cube, {
      rotateX: 90,
      rotateY: 0,
      duration: config.duration! / 3 / 1000,
    }); // short rotation back to 1
    timeline.to(".container", {
      scale: perc,
      duration: config.duration! / 3 / 1000,
    });
    //tl.to(cube, { rotateX: 90, rotateY: 90, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 180, rotateY: 180, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 0, rotateY: 360, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 45, rotateY: 0, duration: 1 }); // short rotation back to 1
    //tl.to(cube, { rotateX: 90, rotateY: 0, duration: 1 }); // short rotation back to 1
  }

  function destroy(config: any) {
    logger.debug("cube destroy");

    timeline.clear();
    timeline.kill();
  }

  function rootStart(config: any) {
    logger.debug("cube rootStart");
  }

  function rootStop(config: any) {
    logger.debug("cube rootStop");
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("cube start");

    const cube = slideTransitionHolder!.getElementsByClassName("cube")[0];
    gsap.set(cube, {
      rotateY: 0,
      rotateX: 0,
    });

    // NOTE: reattach slide
    if (config?.prevSlideEl) {
      const frontEl = slideTransitionHolder!.getElementsByClassName(
        "front"
      )[0] as HTMLDivElement;
      frontEl.appendChild(config?.prevSlideEl);
    }
    console.log("cube apply slide 2");

    const bottomEl = slideTransitionHolder!.getElementsByClassName(
      "bottom"
    )[0] as HTMLDivElement;
    bottomEl.appendChild(config?.nextSlideEl!);

    const video = bottomEl.getElementsByTagName("video")[0];
    if (video) {
      console.log(video);
      video!.muted = true;
      video!.src = video.src;
      video.autoplay = true;
      video!.play();
    }

    //video?.play();

    config!.nextSlideEl!.style.display = "block";

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("cube stop");

    const slidesHolder = document.getElementsByClassName(
      "slidesHolder"
    )[0] as HTMLDivElement;
    if (config?.prevSlideEl) {
      slidesHolder.appendChild(config?.prevSlideEl);
    }

    slidesHolder.appendChild(config?.nextSlideEl!);

    if (config.prevSlideEl) config.prevSlideEl.style.display = "none";

    // TODO: why not use slideTransitionHolder???
    const slideTransitionHolder2 = document.getElementsByClassName(
      "slideTransitionHolder"
    )[0];
    slideTransitionHolder2?.parentNode?.removeChild(slideTransitionHolder2);
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("cube pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("cube resume");
    timeline.resume();
  }

  return {
    start,
    stop,
    init,
    destroy,
    update,
    pause,
    resume,
    rootStart,
    rootStop,
  };
}

const cubeDef = {
  effectId: "cube",
  effectFunc: cubeAnimation,
};
export default cubeDef;

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function addCSS(target: HTMLDivElement, config: ICubeEffect) {
  const bgColor = colorToString(config.cubeBackgroundColor);
  const edgeColor = colorToString(config.cubeEdgeColor);

  target.innerHTML = `
      <style>
        .container {
          width: ${areaW}px;
          height: ${areaH}px;
          perspective: ${
            areaH * 2
          }px; /* psst...something fun happens when this is a really small number */
  
          position:absolute;
          opacity: 1;
          left22: 25%;
          transform: scale(${perc});
          top: 0px;
        }
        .face {
          background: ${bgColor};
          border: 1px solid ${edgeColor};
          backface-visibility: hidden;
        }
        .cube, .face {
          position: absolute;
          height: 100%;
          width: 100%;
          transform-style: preserve-3d;
          background-size: 100% 100%;
        }
        .front {
          width: ${areaW}px;
          height: ${areaH}px;
        }
        .back {
          width: ${areaW}px;
          height: ${areaH}px;
        }
        .left {
          left22: -${moveP2}px;
        }
        .right {
          left: ${moveP2}px;
        
        }
        .bottom{
          left33: -${moveP2}px;
          width:${areaW}px;
          height: ${areaH}px;
        }
      </style>
   `;
}
