import { RGBColor } from "react-color";
import { INumericTimelineValue } from "../../webslider-sdk/src/inputs/i-inputs";
import { logger } from "../../webslider-sdk/src/utils/logger/logger";
import { getObjectElementById } from "../animation-utils";
import { getMethodByType } from "../common";
import { IEffectBase } from "../types";
import { ISquareMaskEffect } from "./square-mask.types";

export function squareMaskAnimation() {
  let timeline: gsap.core.Timeline;
  let objectEl: HTMLDivElement;
  let borderEl: HTMLElement;
  let teardownEffect: any;
  let borderColor: string;
  let topBorderColor: string;
  let bottomBorderColor: string;
  let leftBorderColor: string;
  let rightBorderColor: string;

  function init(config: ISquareMaskEffect) {
    logger.debug("squareMask init");

    objectEl = getObjectElementById(config.itemId!);
    borderColor = colorToString(config.borderColor.borderColor);
    topBorderColor = colorToString(config.borderColor.topBorderColor);
    bottomBorderColor = colorToString(config.borderColor.bottomBorderColor);
    leftBorderColor = colorToString(config.borderColor.leftBorderColor);
    rightBorderColor = colorToString(config.borderColor.rightBorderColor);

    teardownEffect = () => {
      if (config.hideMaskOnComplete) {
        borderEl.parentElement?.removeChild(borderEl);
      }
    };

    timeline = gsap.timeline({
      duration: config.duration! / 1000,
      ease: config.ease!,
    });
  }

  function rootStart(config: any) {
    logger.debug("squareMask rootStart");

    timeline.pause();
    timeline.progress(0);
  }

  function rootStop(config: any) {
    logger.debug("squareMask rootStop");

    timeline.pause();
    timeline.progress(0);
  }

  function start(config: any, isManual?: boolean) {
    logger.debug("squareMask start");

    borderEl = objectEl.getElementsByClassName("square-mask")[0] as HTMLElement;

    if (borderEl === undefined) {
      borderEl = document.createElement("div");
      borderEl.className = "square-mask";
      borderEl.style.position = "absolute";
      borderEl.style.top = "0";
      borderEl.style.left = "0";
      objectEl.appendChild(borderEl);
    }

    if (config.borderColor.useCommonValue) {
      borderEl.style.border = `solid ${borderColor} 0px`;
    } else {
      borderEl.style.borderTop = `solid ${topBorderColor} 0px`;
      borderEl.style.borderBottom = `solid ${bottomBorderColor} 0px`;
      borderEl.style.borderLeft = `solid ${leftBorderColor} 0px`;
      borderEl.style.borderRight = `solid ${rightBorderColor} 0px`;
    }

    borderEl.style.width = `${config.objectProperties?.width}px`;
    borderEl.style.height = `${config.objectProperties?.height}px`;

    // timeline.clear();

    addSquareMaskEffectPartToTimeline({
      timeline: timeline,
      borderEl,
      config: config,
      value: config.borderBottom,
      propertyName: "borderBottomWidth",
    });

    addSquareMaskEffectPartToTimeline({
      timeline: timeline,
      borderEl,
      config: config,
      value: config.borderTop,
      propertyName: "borderTopWidth",
    });

    addSquareMaskEffectPartToTimeline({
      timeline: timeline,
      borderEl,
      config: config,
      value: config.borderLeft,
      propertyName: "borderLeftWidth",
    });

    addSquareMaskEffectPartToTimeline({
      timeline: timeline,
      borderEl,
      config: config,
      value: config.borderRight,
      propertyName: "borderRightWidth",
    });

    timeline.play(0);
    if (isManual) timeline.pause();
  }

  function stop(config: any, isManual?: boolean, isReverse?: boolean) {
    logger.debug("squareMask stop");

    teardownEffect();
  }

  function update(config: any, time: number, isManual?: boolean) {
    logger.debug("squareMask update");

    if (isManual) {
      console.log("MANUAL UPDATE: " + time);
      timeline.seek(time / 1000);
    }
  }

  function pause(config: any) {
    logger.debug("squareMask pause");
    timeline.pause();
  }

  function resume(config: any) {
    logger.debug("squareMask resume");
    timeline.resume();
  }

  function destroy(config: any) {
    logger.debug("squareMask destroy");
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

function addSquareMaskEffectPartToTimeline({
  borderEl,
  timeline,
  config,
  propertyName,
  value,
}: {
  borderEl: Element;
  timeline: gsap.core.Timeline;
  config: IEffectBase;
  propertyName: string;
  value: INumericTimelineValue;
}) {
  return timeline[getMethodByType(config.type, true)](
    borderEl,
    {
      ease: config.ease,
      duration: value.hasTimelineProperties
        ? value.duration / 1000
        : config.duration! / 1000,
      [propertyName]: value.value,
    },
    value.hasTimelineProperties ? value.delay / 1000 : 0
  );
}
