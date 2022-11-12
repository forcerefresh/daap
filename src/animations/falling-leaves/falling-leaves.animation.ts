import gsap from "gsap";
import { createLogger } from "webslider-sdk/lib/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import {
  FALLING_LEAVES_ANIMATION,
  IFallingLeaves,
} from "./falling-leaves.types";
import { getMediaSrc } from "../../integration/utils/local-media";

const logger = createLogger();

export function fallingLeavesAnimation() {
  let element: HTMLDivElement;
  let timelineArr: gsap.core.Timeline[] = [];

  function init(config: IFallingLeaves) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} init`);

    element = getObjectElementById(config.itemId!);

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
      // CHECK IT
      timelineArr.push(leafAnimation(leafEl, w, h));
    }
  }

  function rootStart(config: any) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} rootStart`);

    if (config.type === "in") {
      element.style.display = "none";
    }
  }

  function rootStop(config: any) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} rootStop`);

    if (config.type === "out") {
      element.style.display = "none";
    }
  }

  function start(config: any, isManual?: boolean) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} start`);
    element.style.display = "block";

    timelineArr.forEach((tl) => {
      tl.play();
    });
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} stop`);
    element.style.display = "none";

    if (isManual) {
      // goto end because we set display:none at te end of timeline
      // timeline.progress(config.duration / 1000);
    }
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      // timeline.seek(time / 1000);
      // timelineArr.forEach((tl) => {
      //   tl.seek(time / 1000);
      // });
    }
  }

  function pause(config: any) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} pause`);
    timelineArr.forEach((tl) => {
      tl.pause();
    });
  }

  function resume(config: any) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} resume`);
    timelineArr.forEach((tl) => {
      tl.resume();
    });
  }

  function destroy(config: any) {
    logger.debug(`${FALLING_LEAVES_ANIMATION} destroy`);

    timelineArr.forEach((tl) => {
      tl.clear();
      tl.kill();
    });
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

function rangeRandom(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function leafAnimation(elm: Element, w: number, h: number) {
  const tl = gsap.timeline();

  tl.to(elm, {
    duration: rangeRandom(6, 15),
    y: h + 100,
    ease: "none",
    repeat: -1,
    delay: -15,
    onStart: () => {},
    onComplete: () => {},
  });

  tl.to(elm, {
    duration: rangeRandom(4, 8),
    x: "+=100",
    rotationZ: rangeRandom(0, 180),
    repeat: -1,
    yoyo: true,
    ease: "Sine.easeInOut",
  });

  tl.to(elm, {
    duration: rangeRandom(2, 8),
    rotationX: rangeRandom(0, 360),
    rotationY: rangeRandom(0, 360),
    repeat: -1,
    yoyo: true,
    ease: "Sine.easeInOut",
    delay: -5,
  });

  return tl;
}
