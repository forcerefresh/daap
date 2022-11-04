import gsap from "gsap";
import { RGBColor } from "react-color";
import { INumericTimelineValue } from "webslider-sdk2/lib/inputs/i-inputs";
import { getMethodByType } from "../common";
import { IAnimationBase } from "../types";
import {
  ISquareMaskAnimation,
  SQUARE_MASK_ANIMATION,
} from "./square-mask.types";

gsap.registerEffect({
  name: SQUARE_MASK_ANIMATION,
  effect: function (targets: any, config: ISquareMaskAnimation) {
    const objectEl = targets[0] as HTMLElement;
    const borderColor = colorToString(config.borderColor.borderColor);
    const topBorderColor = colorToString(config.borderColor.topBorderColor);
    const bottomBorderColor = colorToString(
      config.borderColor.bottomBorderColor
    );
    const leftBorderColor = colorToString(config.borderColor.leftBorderColor);
    const rightBorderColor = colorToString(config.borderColor.rightBorderColor);

    let borderEl: HTMLElement;

    let started: boolean;

    //let initialized = false
    const initializeAnimation = () => {
      borderEl = objectEl.getElementsByClassName(
        "square-mask"
      )[0] as HTMLElement;

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

      rootTimeline.clear();

      addSquareMaskAnimationPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderBottom,
        propertyName: "borderBottomWidth",
      });

      addSquareMaskAnimationPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderTop,
        propertyName: "borderTopWidth",
      });

      addSquareMaskAnimationPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderLeft,
        propertyName: "borderLeftWidth",
      });

      addSquareMaskAnimationPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderRight,
        propertyName: "borderRightWidth",
      });
    };

    const teardownAnimation = () => {
      if (config.hideMaskOnComplete) {
        borderEl.parentElement?.removeChild(borderEl);
      }
    };

    const rootTimeline = gsap.timeline({
      duration: config.duration!,
      ease: config.ease!,
    });

    rootTimeline.eventCallback("onComplete", () => {
      if (started) {
        teardownAnimation();
        started = false;
      }
    });

    rootTimeline.eventCallback("onStart", () => {
      if (!started) {
        initializeAnimation();
        started = true;
      }
    });

    rootTimeline.eventCallback("onUpdate", () => {
      if (!started) {
        initializeAnimation();
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

function addSquareMaskAnimationPartToTimeline({
  borderEl,
  timeline,
  config,
  propertyName,
  value,
}: {
  borderEl: Element;
  timeline: gsap.core.Timeline;
  config: IAnimationBase;
  propertyName: string;
  value: INumericTimelineValue;
}) {
  return timeline[getMethodByType(config.type, true)](
    borderEl,
    {
      ease: config.ease,
      duration: value.hasTimelineProperties
        ? value.duration / 1000
        : config.duration!,
      [propertyName]: value.value,
    },
    value.hasTimelineProperties ? value.delay / 1000 : 0
  );
}
