import { CSSProperties } from "react";
import { DeviceType } from "webslider-sdk/lib/common/i-device-type";
import {
  IBorderValue,
  IClipMaskValue,
  ICornerRadiusValue,
  IInputMetadataValues,
} from "webslider-sdk/lib/inputs/i-inputs";
import { CommonPropertiesValues } from "webslider-sdk/lib/objects/common-properties";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";
import { TransformPropertiesValues } from "webslider-sdk/lib/objects/transform-properties";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commonProperties = getObjectValuesForDevice(
    values as CommonPropertiesValues,
    deviceType
  ) as any;

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
  const _br = borderRadius as any;
  if (_br.common) {
    cssProperties.borderRadius = _br.common;
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
  const _b = border as any;
  if (_b.useCommonValue) {
    cssProperties.borderWidth = _b.commonBorder.width;
    cssProperties.borderColor += convertRGBColor2RGBAString(_b.commonBorder.color);
    cssProperties.borderStyle = _b.commonBorder.style;
  } else {
    addBorderSide_CSSProperties(cssProperties, "Top", _b.top);
    addBorderSide_CSSProperties(cssProperties, "Bottom", _b.bottom);
    addBorderSide_CSSProperties(cssProperties, "Left", _b.left);
    addBorderSide_CSSProperties(cssProperties, "Right", _b.right);
  }
}

export function addBorderSide_CSSProperties(
  cssProperties: CSSProperties,
  side: "Left" | "Bottom" | "Right" | "Top",
  border: IBorderValue
) {
  (cssProperties as any)["border" + side + "Width"] = border.width;
  (cssProperties as any)["border" + side + "Color"] =
    convertRGBColor2RGBAString(border.color);
  (cssProperties as any)["border" + side + "Style"] = border.style;
}

// TRANSFORM

export function addTransformPropertiesToCSSProperties(
  cssProperties: CSSProperties,
  values?: {
    [key: string]: any;
  },
  _valuesMetadata?: {
    [key: string]: IInputMetadataValues;
  },
  deviceType?: DeviceType
) {
  if (!values) {
    return;
  }

  const transformProperties = getObjectValuesForDevice(
    values as TransformPropertiesValues,
    deviceType
  ) as any;

  let transform = "";
  if (transformProperties.hasTranslate) {
    transform += `translateX(${transformProperties.transformTranslateX}) translateY(${transformProperties.transformTranslateY}) translateZ(${transformProperties.transformTranslateZ}) `;
  }

  if (transformProperties.hasScale) {
    transform += `scaleX(${transformProperties.transformScaleX}) scaleY(${transformProperties.transformScaleY}) scaleZ(${transformProperties.transformScaleY}) `;
  }

  if (transformProperties.hasRotate) {
    transform += `rotateX(${transformProperties.transformRotateX}) rotateY(${transformProperties.transformRotateY}) rotateZ(${transformProperties.transformRotateZ}) `;
  }

  if (transformProperties.hasSkew) {
    transform += `skewX(${transformProperties.transformSkewX}) skewY(${transformProperties.transformSkewY}) `;
  }

  if (transform) {
    cssProperties.transform = transform;
  }

  // transform-origin
  if (
    transformProperties.transformOriginX &&
    transformProperties.transformOriginY
  ) {
    cssProperties.transformOrigin =
      transformProperties.transformOriginX +
      " " +
      transformProperties.transformOriginY;
  }
}
