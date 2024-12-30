import { last } from "lodash-es";
import React from "react";
import { RGBColor } from "react-color";
import {
  IBorderSideValue,
  IBorderValue,
  ICornerRadiusValue,
} from "webslider-sdk/lib/inputs/i-inputs";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";
import { ISettings } from "../store/reducers/i-settings";
import { IPage } from "../store/reducers/i-pages";

export function getRealSlideDuration(slide: IPage, settings: ISettings) {
  return "10s";
  // return slide.duration.inheritFrom === "inherit"
  //   ? settings.slideDuration
  //   : slide.duration.customValue;
}

export function getRealExitSlideDuration(slide: IPage, settings: ISettings) {
  return "2s";
  // return slide.exitDuration.inheritFrom === "inherit"
  //   ? settings.exitSlideDuration
  // : slide.exitDuration.customValue;
}

export function getRealSlideDurationVisual(slide: IPage, settings: ISettings) {
  const dur = getRealSlideDuration(slide, settings);
  const durMs = convertTimeUnitToMs(dur);
  return (durMs / 1000).toString() + "s";
}

export function getRealExitSlideDurationVis(slide: IPage, settings: ISettings) {
  const dur = getRealExitSlideDuration(slide, settings);
  const durMs = convertTimeUnitToMs(dur);
  return (durMs / 1000).toString() + "s exit";
}

export function convertTimeUnitToMs(timeUnit: string) {
  let durMs: number;
  if (timeUnit.indexOf("ms") !== -1) {
    durMs = parseInt(timeUnit, 10);
  } else if (timeUnit.indexOf("s") !== -1) {
    durMs = parseInt(timeUnit, 10) * 1000;
  } else {
    durMs = parseInt(timeUnit, 10);
  }
  return durMs;
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

export function convertRGBColor2CSSProperties(
  c?: RGBColor
): React.CSSProperties {
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

export function addBackgroundColor(style: string, background: RGBColor) {
  if (background) {
    style +=
      "background: " +
      convertRGBColor2CSSProperties(background).backgroundColor +
      ";";
  }
  return style;
}

export function addPaddingColor(style: string, padding: number) {
  if (padding) {
    style += "padding: " + padding + "px;";
  }
  return style;
}

export function addBorder(style: string, border: IBorderValue) {
  if (border.useCommonValue) {
    style += "border-width: " + border.commonBorder.width + ";";
    style +=
      "border-color: " +
      convertRGBColor2RGBAString(border.commonBorder.color) +
      ";";
    style += "border-style: " + border.commonBorder.style + ";";
  } else {
    style = addBorderSide(style, "top", border.top);
    style = addBorderSide(style, "bottom", border.bottom);
    style = addBorderSide(style, "left", border.left);
    style = addBorderSide(style, "right", border.right);
  }
  return style;
}

export function addBorderSide(
  style: string,
  side: "left" | "bottom" | "right" | "top",
  border: IBorderSideValue
) {
  style += "border-" + side + "-width: " + border.width + ";";
  style +=
    "border-" +
    side +
    "-color: " +
    convertRGBColor2RGBAString(border.color) +
    ";";
  style += "border-" + side + "-style: " + border.style + ";";
  return style;
}

export function humanizeSting(str: string, removeDottedPart = false) {
  let targetStr = str;
  if (removeDottedPart) {
    const peaces = str.split(".");
    targetStr = peaces[peaces.length - 1];
  }
  targetStr = targetStr.replaceAll("_", " ").replaceAll("-", " ");
  targetStr = targetStr.charAt(0).toUpperCase() + targetStr.slice(1);
  return targetStr;
}

export function forceDownload(url: string) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function () {
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(this.response);
    var tag = document.createElement("a");
    tag.href = imageUrl;
    tag.download = last(url.split("/")) || "image.png";
    document.body.appendChild(tag);
    tag.click();
    document.body.removeChild(tag);
  };
  xhr.send();
}

export function getBooleanValue(
  val: boolean | undefined,
  defValue: boolean = false
): boolean {
  return typeof val === "undefined" ? defValue : val;
}

export function hexToRGB(hex: string, a?: number) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (a) {
    return { r, g, b, a };
  } else {
    return { r, g, b, a: 1 };
  }
}

export function getNameFromFilename(filename: string): string {
  const arr = filename.split(".");
  arr.pop();
  return arr.join(".");
}
