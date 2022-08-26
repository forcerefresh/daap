import { getMethodByType } from "../common";
import gsap from "gsap";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { IFallingLeaves } from "./falling-leaves.types";
import { getMediaSrc } from "../../integration/utils/local-media";

function fallingLeavesAnimation() {
  let timeline: gsap.core.Timeline;
  let element: HTMLDivElement;

  function init(config: IFallingLeaves) {
    logger.debug("fallingLeaves init");

    element = getObjectElementById(config.itemId!);
    // initialState.opacity = element.style.opacity;

    gsap.set(element, { perspective: 600, display: "none" });
    element.style.overflow = "hidden";

    const leafEls: HTMLDivElement[] = [];

    // required in order to cleanup  when restart
    gsap.killTweensOf(element.children);

    var total = config.number;
    var w = config.objectProperties?.width!;
    var h = config.objectProperties?.height!;

    element.innerHTML = "";

    const imageItem = getMediaSrc("image", config.image.image);

    for (let i = 0; i < total; i++) {
      var leafEl = document.createElement("div");
      leafEl.style.position = "absolute";
      leafEl.innerHTML = `<img src="${imageItem.src}" width="${config.width}" height="${config.height}" />`;
      leafEls.push(leafEl);

      gsap.set(leafEl, {
        //attr: { class: "dot" },
        x: rangeRandom(-50, w - 100),
        y: rangeRandom(-150, -100),
        z: rangeRandom(-200, 200),
      });

      element.appendChild(leafEl);

      const oneLeafTween = leafEffect(leafEl, w, h);
      //leafTweens.push(oneLeafTween);
    }

    // return ROOT timeline
    timeline = gsap.timeline({ paused: true });

    timeline.to(element, { display: "block", duration: 0.0000001 });
    timeline.to(element, {
      duration: config.duration! - 0.0000002,
    });
    timeline.to(element, { display: "none", duration: 0.0000001 });
  }

  function rootStart(config: any) {
    logger.debug("fallingLeaves rootStart");

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: any) {
    logger.debug("fallingLeaves rootStop");

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  /*
  function rootStart(config: any) {
    logger.debug("fallingLeaves rootStart");
    if (config.type === "in") element.style.opacity = "0";
  }

  function rootStop(config: any) {
    logger.debug("fallingLeaves rootStop");
    if (config.type === "out") element.style.opacity = "1";
  }*/

  function start(config: any, isManual?: boolean) {
    logger.debug("fallingLeaves start");

    //element.style.opacity = config.type === "in" ? "0" : "1"; //initialState.opacity;

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("fallingLeaves stop");

    timeline.pause();

    if (isManual) {
      // goto end because we set display:none at te end of timeline
      timeline.progress(config.duration / 1000);
    }
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("fallingLeaves pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("fallingLeaves resume");
    timeline.resume();
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
  };
}

const fallingLeavesDef = {
  effectId: "fallingLeaves",
  effectFunc: fallingLeavesAnimation,
};
export default fallingLeavesDef;

function rangeRandom(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function leafEffect(elm: Element, w: number, h: number): TweenMax {
  //const tl = gsap.timeline();

  const tweenToRet = TweenMax.to(elm, {
    duration: rangeRandom(6, 15),
    y: h + 100,
    ease: "none",
    repeat: -1,
    delay: -15,
    onStart: () => {},
    onComplete: () => {},
  });

  gsap.to(elm, {
    duration: rangeRandom(4, 8),
    x: "+=100",
    rotationZ: rangeRandom(0, 180),
    repeat: -1,
    yoyo: true,
    ease: "Sine.easeInOut",
  });

  gsap.to(elm, {
    duration: rangeRandom(2, 8),
    rotationX: rangeRandom(0, 360),
    rotationY: rangeRandom(0, 360),
    repeat: -1,
    yoyo: true,
    ease: "Sine.easeInOut",
    delay: -5,
  });

  return tweenToRet;
  //return tl;
}
