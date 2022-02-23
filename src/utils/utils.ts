import React from "react";
import { RGBColor } from "react-color";
import { ICornerRadiusValue } from "../inputs/types";
import { IObject } from "../objects/types";
import { ISettings } from "../store/reducers/i-settings";
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

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getCroppedFileName(str: string, firstPart = 16, lastPart = 8) {
  if (str.length > firstPart + lastPart) {
    return str.substr(0, firstPart) + "..." + str.substr(-lastPart);
  }
  return str;
}

export function rgbColor2cssRgba(c: RGBColor): string {
  return `rgba(${c?.r},${c?.g},${c?.b},${c?.a})`;
}

export function addCommonPropertiesToStyle(style: string, object: IObject) {
  //console.log(object.commonProperties);
  if (object.commonProperties?.borderRadius) {
    style = addBorderRadius(style, object.commonProperties?.borderRadius);
  }

  //console.log(style);
  return style;
}

export function addBorderRadius(
  style: string,
  borderRadius: ICornerRadiusValue
) {
  if (borderRadius.common) {
    style += "border-radius: " + borderRadius.common + ";";
  } else if (borderRadius.tl) {
    style +=
      "border-radius: " +
      borderRadius.tl +
      " " +
      borderRadius.tr +
      " " +
      borderRadius.br +
      " " +
      borderRadius.bl +
      ";";
  }
  return style;
}
