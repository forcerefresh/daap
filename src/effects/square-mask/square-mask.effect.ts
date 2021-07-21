import gsap from "gsap";
import { RGBColor } from "react-color";
import { INumericTimelineValue } from "../../inputs/types";
import { getMethodByType } from "../common";
import { createRootTimelineForTextEffect } from "../text.utils";
import { IEffectBase } from "../types";
import { ISquareMaskEffect, squareMask } from "./square-mask.types";

gsap.registerEffect({
  name: squareMask,
  effect: function (targets: any, config: ISquareMaskEffect) {
    const borderColor = colorToString(config.borderColor);
    let borderEl: HTMLElement;
    const existSquareMaskEl = document.getElementsByClassName("square-mask")[0];
    if (existSquareMaskEl === undefined) {
      borderEl = document.createElement("div");
      borderEl.className = "square-mask";
      borderEl.style.position = "absolute";
      borderEl.style.top = "0";
      borderEl.style.left = "0";
      borderEl.style.border = `solid ${borderColor} 0px`;
      borderEl.style.width = `${config.objectProperties?.width}px`;
      borderEl.style.height = `${config.objectProperties?.height}px`;
      targets[0].appendChild(borderEl);
    }

    const initializeEffect = () => {
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
      borderEl.parentElement?.removeChild(borderEl);
      if (!config.hideMaskOnComplete) {
        targets[0].appendChild(borderEl);
      }
    };

    const rootTimeline = createRootTimelineForTextEffect({
      timelineConfig: {
        duration: config.duration!,
        ease: config.ease!,
      },
      target: targets[0] as HTMLElement,
      initializeEffect,
      teardownEffect,
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
  timeline[getMethodByType(config.type, true)](
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
