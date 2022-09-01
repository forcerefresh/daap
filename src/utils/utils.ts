import React from "react";
import { RGBColor } from "react-color";
import {
  IBorderSideValue,
  IBorderValue,
  ICornerRadiusValue,
  IInputMetadataValues,
} from "../webslider-sdk/src/inputs/i-inputs";
import { CommonPropertiesValues } from "../webslider-sdk/src/objects/common-properties";
import { IObject } from "../webslider-sdk/src/objects/i-object";
import { ILayer } from "../store/reducers/i-layers";
import { ISettings } from "../store/reducers/i-settings";
import { ISlide } from "../store/reducers/i-slides";
import { nlRemove } from "./doom-utils/common";

export function getRealSlideDuration(slide: ISlide, settings: ISettings) {
  return slide.duration.inheritFrom === "inherit"
    ? settings.slideDuration
    : slide.duration.customValue;
}

export function getRealExitSlideDuration(slide: ISlide, settings: ISettings) {
  return slide.exitDuration.inheritFrom === "inherit"
    ? settings.exitSlideDuration
    : slide.exitDuration.customValue;
}

export function getRealSlideDurationVisual(slide: ISlide, settings: ISettings) {
  const dur = getRealSlideDuration(slide, settings);
  const durMs = convertTimeUnitToMs(dur);
  return (durMs / 1000).toString() + " sec";
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

export function addCommonPropertiesToStyle(
  style: string,
  object: IObject | ILayer
) {
  const comonProperties = object.definition.values as CommonPropertiesValues;

  const comonPropertiesMeta = object.definition.valuesMetadata as {
    [key: string]: IInputMetadataValues;
  };

  if (!comonProperties.hasCommonProperties) {
    return "";
  }

  if (!comonPropertiesMeta.commonCornerRadius.disabled) {
    style = addBorderRadius(style, comonProperties.commonCornerRadius);
  }

  if (!comonPropertiesMeta.commonBorder.disabled) {
    style = addBorder(style, comonProperties.commonBorder);
  }

  if (!comonPropertiesMeta.commonOverflow.disabled) {
    style += `overflow: ${comonProperties.commonOverflow};`;
  }

  if (!comonPropertiesMeta.commonInlineStyle.disabled) {
    const inlineStyle = nlRemove(comonProperties.commonInlineStyle);
    style += inlineStyle;
  }

  if (!comonPropertiesMeta.commonBackgroundColor.disabled) {
    style = addBackgroundColor(style, comonProperties.commonBackgroundColor);
  }

  if (!comonPropertiesMeta.commonPadding.disabled) {
    style = addPaddingColor(style, comonProperties.commonPadding);
  }

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

export function addBackgroundColor(style: string, background: RGBColor) {
  if (background) {
    style += "background: " + getBgColor(background).backgroundColor + ";";
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
      "border-color: " + rgbColor2cssRgba(border.commonBorder.color) + ";";
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
  style += "border-" + side + "-color: " + rgbColor2cssRgba(border.color) + ";";
  style += "border-" + side + "-style: " + border.style + ";";
  return style;
}

export function humanizeSting(str: string) {
  let ret = str.replaceAll("_", " ").replaceAll("-", " ");
  ret = ret.charAt(0).toUpperCase() + ret.slice(1);
  return ret;
}
