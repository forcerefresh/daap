import { CSSProperties } from "react";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import {
  IBorderSideValue,
  IBorderValue,
  IClipMaskValue,
  ICornerRadiusValue,
  IInputMetadataValues,
} from "webslider-sdk/lib/inputs/i-inputs";
import { CommonPropertiesValues } from "webslider-sdk/lib/objects/common-properties";
import { ILayer, IObject } from "webslider-sdk/lib/objects/i-object";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";
import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import {
  convertRGBColor2CSSStyle,
  convertRGBColor2RGBAString,
} from "webslider-sdk/lib/utils/utils";

export function addCommonPropertiesToCSSProperties(
  cssProperties: CSSProperties,
  values?: {
    [key: string]: any;
  },
  valuesMetadata?: {
    [key: string]: IInputMetadataValues;
  },
  deviceType?: DeviceType
) {
  if (!values) {
    return;
  }

  const commonProperties = getObjectValuesForDevice(
    values as CommonPropertiesValues,
    deviceType
  );
  console.log(commonProperties);
  const commonPropertiesMeta = valuesMetadata as {
    [key: string]: IInputMetadataValues;
  };

  if (
    commonPropertiesMeta.commonOpacity &&
    !commonPropertiesMeta.commonOpacity.disabled &&
    typeof commonProperties.commonOpacity !== "undefined"
  ) {
    cssProperties.opacity = commonProperties.commonOpacity
      ? commonProperties.commonOpacity / 100
      : 0;
  }

  if (
    commonPropertiesMeta.commonBlur &&
    !commonPropertiesMeta.commonBlur.disabled &&
    typeof commonProperties.commonBlur !== "undefined"
  ) {
    cssProperties.filter = `blur(${commonProperties.commonBlur})`;
  }

  if (!commonPropertiesMeta.commonCornerRadius.disabled) {
    addBorderRadius_CSSProperties(
      cssProperties,
      commonProperties.commonCornerRadius
    );
  }

  if (!commonPropertiesMeta.commonBorder.disabled) {
    addBorder_CSSProperties(cssProperties, commonProperties.commonBorder);
  }

  if (!commonPropertiesMeta.commonOverflow.disabled) {
    cssProperties.overflow = commonProperties.commonOverflow;
  }

  // this is disabled per device
  // if (!commonPropertiesMeta.commonInlineStyle.disabled) {
  //   const inlineStyle = nlRemove(commonProperties.commonInlineStyle);
  //   style += inlineStyle;
  // }

  if (!commonPropertiesMeta.commonBackgroundColor.disabled) {
    addBackgroundColor_CSSProperties(
      cssProperties,
      commonProperties.commonBackgroundColor
    );
  }

  if (!commonPropertiesMeta.commonPadding.disabled) {
    addPaddingColor_CSSProperties(
      cssProperties,
      commonProperties.commonPadding
    );
  }

  if (
    commonPropertiesMeta.commonClipMask &&
    !commonPropertiesMeta.commonClipMask.disabled
  ) {
    addClipMask_CSSProperties(cssProperties, commonProperties.commonClipMask);
  }
}

export function addBorderRadius_CSSProperties(
  cssProperties: CSSProperties,
  borderRadius: ICornerRadiusValue
) {
  if (borderRadius.common) {
    cssProperties.borderRadius = borderRadius.common;
  } else if (borderRadius.tl) {
    cssProperties.borderRadius =
      borderRadius.tl +
      " " +
      borderRadius.tr +
      " " +
      borderRadius.br +
      " " +
      borderRadius.bl;
  }
}

export function addBackgroundColor_CSSProperties(
  cssProperties: CSSProperties,
  background: RGBColor
) {
  if (background) {
    cssProperties.backgroundColor =
      convertRGBColor2CSSStyle(background).backgroundColor;
  }
}

export function addClipMask_CSSProperties(
  cssProperties: CSSProperties,
  clipMask: IClipMaskValue
) {
  if (clipMask) {
    const pArr = clipMask.point.map((p) => `${p.x} ${p.y}`);
    cssProperties.clipPath = "polygon(" + pArr.join(",") + ")";
  }
}

export function addPaddingColor_CSSProperties(
  cssProperties: CSSProperties,
  padding: number
) {
  if (padding) {
    cssProperties.padding = padding + "px";
  }
}

export function addBorder_CSSProperties(
  cssProperties: CSSProperties,
  border: IBorderValue
) {
  if (border.useCommonValue) {
    cssProperties.borderWidth = border.commonBorder.width;
    cssProperties.borderColor += convertRGBColor2RGBAString(
      border.commonBorder.color
    );
    cssProperties.borderStyle = border.commonBorder.style;
  } else {
    addBorderSide_CSSProperties(cssProperties, "Top", border.top);
    addBorderSide_CSSProperties(cssProperties, "Bottom", border.bottom);
    addBorderSide_CSSProperties(cssProperties, "Left", border.left);
    addBorderSide_CSSProperties(cssProperties, "Right", border.right);
  }
}

export function addBorderSide_CSSProperties(
  cssProperties: CSSProperties,
  side: "Left" | "Bottom" | "Right" | "Top",
  border: IBorderSideValue
) {
  (cssProperties as any)["border" + side + "Width"] = border.width;
  (cssProperties as any)["border" + side + "Color"] =
    convertRGBColor2RGBAString(border.color);
  (cssProperties as any)["border" + side + "Style"] = border.style;
}
