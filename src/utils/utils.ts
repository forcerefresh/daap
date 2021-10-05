import React from "react";
import { RGBColor } from "react-color";
import { ISettings } from "../store/reducers/settings";
import { ISlide } from "../store/reducers/i-slides";

export function getRealSlideDuration(slide: ISlide, settings: ISettings) {
  return slide.duration.inheritFrom === "inherit"
    ? settings.slideDuration
    : slide.duration.customValue;
}

export function getRealSlideDurationVisual(slide: ISlide, settings: ISettings) {
  const dur = getRealSlideDuration(slide, settings);
  return (dur / 1000).toString() + " sec";
}

export function removeFalsy(obj: { [key: string]: any }) {
  let newObj: { [key: string]: any } = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
}

export function getBgColor(c?: RGBColor): React.CSSProperties {
  if (!c) {
    return {};
  }

  return {
    backgroundColor: `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`,
  };
}
