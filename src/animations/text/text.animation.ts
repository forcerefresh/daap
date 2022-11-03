import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { TEXT_ANIMATION, ITextAnimation } from "./text.types";
import { addTextAnimationPartToTimeline, arrangeChars } from "../text.utils";

export function textAnimation() {
  let timeline: gsap.core.Timeline;
  let objectEL: HTMLDivElement;
  let pElOriginal: HTMLParagraphElement;
  let pElClone: HTMLParagraphElement | null = null;
  let textChars: SplitText;

  let numberOfChars: number = 0;

  let isInitialized = false;

  function init(config: ITextAnimation) {
    logger.debug(`${TEXT_ANIMATION} init`);

    if (isInitialized) return;

    objectEL = getObjectElementById(config.itemId!);
    pElOriginal = objectEL.firstChild as HTMLParagraphElement;

    pElOriginal.style.opacity = config.type === "in" ? "0" : "1";

    numberOfChars = pElOriginal.innerHTML.length;

    const totalDuration =
      config.delayBetweenChar * numberOfChars +
      (config.durationPerChar - config.delayBetweenChar);

    timeline = gsap.timeline({
      pause: true,
      duration: totalDuration, // / 1000,
      // target: objectEL,
      // initializeAnimation,
      // teardownAnimation,
    });

    isInitialized = true;
  }

  function initializeAnimation(config: ITextAnimation) {
    pElClone = pElOriginal.cloneNode(true) as HTMLParagraphElement;
    objectEL.appendChild(pElClone);
    pElClone.style.opacity = config.type === "in" ? "0" : "1";
    // pElClone.innerHTML = pElClone.innerHTML; // space2nbsp(pElClone.innerHTML);

    pElClone.style.opacity = "1"; // config.type === "in" ? "0" : "1";
    pElOriginal.style.opacity = config.type === "in" ? "0" : "1";

    textChars = new SplitText(pElClone, {
      type: "words,chars",
      // position: "absolute",
    });
    const chars = arrangeChars(config.startFrom, textChars.chars);
    gsap.set(chars, { opacity: 1, visibility: "visible" });

    /* 

    const newChars1 = [...chars].slice(0, 4).reverse();
    const newChars2 = [...chars].slice(5, 10);
    const newChars = [...newChars1, ...newChars2];
    rootTimeline.from(
      chars,
      {
        x: gsap.utils.wrap([
          "-=100",
          "-=100",
          "-=100",
          "-=100",
          "-=100",
          "+=100",
          "+=100",
          "+=100",
          "+=100",
          "+=100",
        ]),
        delay: 0.1,
        stagger: {
          amount: (config.delayBetweenChar / 1000) * chars.length,
          from: "center",
        },
      },
      0
    );
*/

    addTextAnimationPartToTimeline({
      timeline: timeline,
      chars,
      config: config,
      value: config.positionX,
      propertyName: "x",
    });

    addTextAnimationPartToTimeline({
      timeline: timeline,
      chars,
      config: config,
      value: config.positionY,
      propertyName: "y",
    });

    addTextAnimationPartToTimeline({
      timeline: timeline,
      chars,
      config: config,
      value: config.rotationPerChar,
      propertyName: "rotation",
    });

    addTextAnimationPartToTimeline({
      timeline: timeline,
      chars,
      config: config,
      value: config.scaleX,
      propertyName: "scaleX",
    });

    addTextAnimationPartToTimeline({
      timeline: timeline,
      chars,
      config: config,
      value: config.scaleY,
      propertyName: "scaleY",
    });

    addTextAnimationPartToTimeline({
      timeline: timeline,
      chars,
      config: config,
      value: config.opacity,
      propertyName: "opacity",
    });

    addTextAnimationPartToTimeline({
      timeline: timeline,
      chars,
      config: config,
      value: { ...config.blur, ...{ value: `blur(${config.blur.value}px)` } }, //{ ...config.blur, ...{ value: `blur(${config.blur}px)` } },
      propertyName: "filter",
    });
  }

  function teardownAnimation(config: ITextAnimation) {
    //textChars.revert(); //// OBSOLETE:  cleanup SplitText outcome  - no need as we clean all (removeChild)
    if (pElClone) {
      pElClone.parentElement?.removeChild(pElClone);
      pElClone.style.opacity = "0";
    }
    pElOriginal.style.opacity = config.type === "in" ? "1" : "0";
    pElClone = null;
  }

  function rootStart(config: ITextAnimation) {
    logger.debug(`${TEXT_ANIMATION} rootStart`);

    if (config.type === "in") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function rootStop(config: ITextAnimation) {
    logger.debug(`${TEXT_ANIMATION} rootStop`);

    if (config.type === "out") {
      timeline.pause();
      timeline.progress(0);
    }
  }

  function start(config: ITextAnimation, isManual?: boolean) {
    logger.debug(`${TEXT_ANIMATION} start`);

    initializeAnimation(config);

    timeline.play(0);

    if (isManual) timeline.pause();
  }

  function stop(
    config: ITextAnimation,
    isManual?: boolean,
    isReverse?: boolean
  ) {
    logger.debug(`${TEXT_ANIMATION} stop`);

    if (isManual) {
      timeline.pause();
      if (isReverse) {
        timeline.progress(0);
      } else {
        timeline.progress(config.duration!); /// 1000
      }
    }
  }

  function update(config: any, time: number, isManual?: boolean) {
    if (isManual) {
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug(`${TEXT_ANIMATION} pause`);

    timeline.pause();
  }

  function resume(config: any) {
    logger.debug(`${TEXT_ANIMATION} resume`);

    timeline.resume();
  }

  function direction(config: any, direction: number) {
    logger.debug(`${TEXT_ANIMATION} reverse`);

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
    direction,
  };
}
