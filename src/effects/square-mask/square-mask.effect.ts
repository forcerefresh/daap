import gsap from "gsap";
import { RGBColor } from "react-color";
import { INumericTimelineValue } from "../../webslider-sdk/src/inputs/i-inputs";
import { getMethodByType } from "../common";
import { IEffectBase } from "../types";
import { ISquareMaskEffect, squareMask } from "./square-mask.types";

gsap.registerEffect({
  name: squareMask,
  effect: function (targets: any, config: ISquareMaskEffect) {
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
    const initializeEffect = () => {
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

      addSquareMaskEffectPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderBottom,
        propertyName: "borderBottomWidth",
      });

      addSquareMaskEffectPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderTop,
        propertyName: "borderTopWidth",
      });

      addSquareMaskEffectPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderLeft,
        propertyName: "borderLeftWidth",
      });

      addSquareMaskEffectPartToTimeline({
        timeline: rootTimeline,
        borderEl,
        config: config,
        value: config.borderRight,
        propertyName: "borderRightWidth",
      });
    };

    const teardownEffect = () => {
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
        teardownEffect();
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
        : config.duration!,
      [propertyName]: value.value,
    },
    value.hasTimelineProperties ? value.delay / 1000 : 0
  );
}
