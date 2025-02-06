import { RGBColor } from "react-color";
import {
  ICheckboxInput,
  IColorArrayInput,
  IColorInput,
  ICornerRadiusInput,
  ICornerRadiusValue,
  IFontSelectInput,
  IFontSelectInputValue,
  IInputMetadataValues,
  InputType,
  INumberInput,
  ISelectInput,
  ISliderInput,
  ITextAreaInput,
  ITextInput,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { nl2br } from "../../utils/doom-utils/common";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import svg from "./rect-icon.svg";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
  TransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import {
  GetHtmlFuncPropsType,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";
import { convertRGBColor2CSSStyle } from "webslider-sdk/lib/utils/utils";

export const RECT = "io.forcerefresh.rect.object";

export interface RectValues {
  strokeWidth: string;
  strokeColor: RGBColor;
  fillColor?: RGBColor;
  borderRadius?: ICornerRadiusValue | string;
}

export type RectPropertiesTuple = [
  IUnitsNumberInput<"strokeWidth">,
  IColorInput<"strokeColor">,
  IColorInput<"fillColor">,
  ICornerRadiusInput<"borderRadius">
];

export function createRectObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(RECT);

  const values: RectValues = {
    strokeWidth: "5px",
    strokeColor: { r: 255, g: 255, b: 255, a: 1 },
    fillColor: undefined,
    borderRadius: "0px",
  };

  object.properties = values;

  return object;
}

export function getRectObjectForm(): RectPropertiesTuple {
  const form: RectPropertiesTuple = [
    {
      displayName: "Width",
      propertyName: "strokeWidth",
      inputType: InputType.UNITS_NUMBER,
      value: "5px",
      defaultValue: "5px",
    },
    {
      displayName: "Color",
      propertyName: "strokeColor",
      inputType: InputType.COLOR,
      value: { r: 255, g: 255, b: 255, a: 1 },
      defaultValue: { r: 255, g: 255, b: 255, a: 1 },
    },
    {
      displayName: "Fill color",
      propertyName: "fillColor",
      inputType: InputType.COLOR,
      value: { r: 255, g: 255, b: 255, a: 0.1 },
      defaultValue: { r: 255, g: 255, b: 255, a: 0.1 },
    },
    {
      displayName: "Growth",
      propertyName: "borderRadius",
      inputType: InputType.CORNER_RADIUS,
      value: "0px",
      defaultValue: "0px",
    },
  ];

  return form;
}

export function getRectHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const rectValues = getObjectValuesForDevice(
    object.properties as RectValues,
    deviceType
  );

  let r = { tl: 0, bl: 0, tr: 0, br: 0 };

  if (typeof rectValues.borderRadius === "string") {
    const commonRadius = rectValues.borderRadius
      ? parseFloat(rectValues.borderRadius)
      : 0;
    r.bl = commonRadius;
    r.tl = commonRadius;
    r.br = commonRadius;
    r.tr = commonRadius;
  } else if (typeof rectValues.borderRadius === "object") {
    r.bl = parseFloat(rectValues.borderRadius.bl!);
    r.tl = parseFloat(rectValues.borderRadius.bl!);
    r.br = parseFloat(rectValues.borderRadius.bl!);
    r.tr = parseFloat(rectValues.borderRadius.bl!);
  }

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);

  const path = svgRectWithBorderRadius(
    0,
    0,
    object.width ?? 100,
    object.height ?? 100,
    r.tl,
    r.tr,
    r.br,
    r.bl
  );

  console.log(path);

  const svg = `
    <svg viewBox="0 0 ${object.width} ${
    object.width
  }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <path  d="${path}" stroke-width="${rectValues.strokeWidth}" stroke="${
    convertRGBColor2CSSStyle(rectValues.strokeColor).backgroundColor
  }" fill="${
    convertRGBColor2CSSStyle(rectValues.fillColor).backgroundColor
  }"></path>
     </svg>`;
  return `<div class="object-content object-content-${object.id}" style="${style}">${svg}</div>`;
}

export async function rectSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    className,
    scale,
    properties,
    skipSizeUpdate,
    deviceType,
    style,
    transform,
  } = props;
  const textValues = getObjectValuesForDevice(
    properties as RectValues,
    deviceType
  );

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  const objectContentEl = objectEl.getElementsByClassName(
    "object-content"
  )[0] as HTMLElement;

  const child = objectEl.firstChild! as HTMLDivElement;

  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  if (!skipSizeUpdate) {
    child.style.width = calculatedObjectSize.width;
    objectWrapperEl.style.width = calculatedObjectSize.width;
    objectEl.style.width = calculatedObjectSize.width;
  }

  addCommonStyleToObjectElementContent(objectContentEl, style, deviceType);
  addTransformStyleToObjectElementContent(
    objectContentEl,
    transform,
    deviceType
  );

  const transformProperties = getObjectValuesForDevice(transform);

  if (transformProperties?.transformOriginX) {
    objectWrapperEl.style.transformOrigin = `${
      transformProperties.transformOriginX ?? "left"
    }  ${transformProperties.transformOriginY ?? "top"}`;
  }
}
export const rectMeta = {
  name: "Rectangle",
  description: "Add rectangle object",
  icon: svg,
  supportWidthResize: true,
};

const svgRectWithBorderRadius = (
  positionX: number,
  positionY: number,
  width: number,
  height: number,
  topLeftRadius: number,
  topRightRadius: number,
  bottomRightRadius: number,
  bottomLeftRadius: number
) => {
  return `M${positionX + topLeftRadius},${positionY}\
      h${width - (topLeftRadius + topRightRadius)}\
      a${topRightRadius},${topRightRadius} 0 0 1 ${topRightRadius},${topRightRadius}\
      v${height - (topRightRadius + bottomRightRadius)}\
      a${bottomRightRadius},${bottomRightRadius} 0 0 1 -${bottomRightRadius},${bottomRightRadius}\
      h-${width - (bottomLeftRadius + bottomRightRadius)}\
      a${bottomLeftRadius},${bottomLeftRadius} 0 0 1 -${bottomLeftRadius},-${bottomLeftRadius}\
      v-${height - (topLeftRadius + bottomLeftRadius)}\
      a${topLeftRadius},${topLeftRadius} 0 0 1 ${topLeftRadius},-${topLeftRadius}\
      z`;
};
