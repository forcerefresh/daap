import { RGBColor } from "react-color";
import {
  IColorGradientInput,
  IColorInput,
  ICornerRadiusInput,
  ICornerRadiusValue,
  IGradientInput,
  ILinearGradientValue,
  InputType,
  INumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import svg from "./rectangle-icon.svg?react";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
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
import {
  FormType,
  IFormGroupItem,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "webslider-sdk/lib/form/i-form-layout";
import { values } from "lodash-es";
import { getSVGFill } from "./shape-utils";

export const RECTANGLE = "io.forcerefresh.rectangle.object";

export interface RectangleValues {
  strokeWidth: string;
  strokeColor: RGBColor;
  fill: ILinearGradientValue | RGBColor;
  cornerRadius?: ICornerRadiusValue | string;
}

export type RectanglePropertiesTuple = [
  INumberInput<"strokeWidth">,
  IColorInput<"strokeColor">,
  IColorGradientInput<"fill">,
  ICornerRadiusInput<"cornerRadius">
];

export function createRectangleObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(RECTANGLE);

  const values: RectangleValues = {
    strokeWidth: initialValue?.strokeWidth ?? "5",
    strokeColor: initialValue?.strokeColor ?? { r: 255, g: 255, b: 255, a: 1 },
    fill: { r: 99, g: 99, b: 99, a: 1 },
    cornerRadius: initialValue?.cornerRadius ?? "0px",
  };

  object.properties = values;

  return object;
}

export function getRectangleObjectForm(): RectanglePropertiesTuple {
  const form: RectanglePropertiesTuple = [
    {
      displayName: "Line",
      propertyName: "strokeWidth",
      inputType: InputType.NUMBER,
      value: 5,
      defaultValue: 5,
    },
    {
      displayName: "Line color",
      propertyName: "strokeColor",
      inputType: InputType.COLOR,
      value: { r: 255, g: 255, b: 255, a: 1 },
      defaultValue: { r: 255, g: 255, b: 255, a: 1 },
    },
    {
      displayName: "Fill",
      propertyName: "fill",
      inputType: InputType.COLOR_GRADIENT,
      value: { r: 99, g: 99, b: 99, a: 1 },
      defaultValue: { r: 99, g: 99, b: 99, a: 1 },
    },
    {
      displayName: "Corner",
      propertyName: "cornerRadius",
      inputType: InputType.CORNER_RADIUS,
      value: "0px",
      defaultValue: "0px",
    },
  ];

  return form;
}

export function getRectangleHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const rectValues = getObjectValuesForDevice(
    object.properties as RectangleValues,
    deviceType
  );

  let r = { tl: 0, bl: 0, tr: 0, br: 0 };

  if (typeof rectValues.cornerRadius === "string") {
    const commonRadius = rectValues.cornerRadius
      ? parseFloat(rectValues.cornerRadius)
      : 0;
    r.bl = commonRadius;
    r.tl = commonRadius;
    r.br = commonRadius;
    r.tr = commonRadius;
  } else if (typeof rectValues.cornerRadius === "object") {
    r.bl = parseFloat(rectValues.cornerRadius.bl!);
    r.tl = parseFloat(rectValues.cornerRadius.bl!);
    r.br = parseFloat(rectValues.cornerRadius.bl!);
    r.tr = parseFloat(rectValues.cornerRadius.bl!);
  }

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);

  const path = svgRectWithCornerRadius(
    0,
    0,
    object.width ?? 100,
    object.height ?? 100,
    r.tl,
    r.tr,
    r.br,
    r.bl
  );

  const fillObj = getSVGFill(rectValues.fill, object.id);

  const svg = `
    <svg viewBox="0 0 ${object.width} ${
    object.height
  }" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${fillObj.gradient}
      <path  d="${path}" stroke-width="${rectValues.strokeWidth}" stroke="${
    convertRGBColor2CSSStyle(rectValues.strokeColor).backgroundColor
  }" ${fillObj.fillAttr}></path>
     </svg>`;
  return `<div class="object-content object-content-${object.id}" style="${style}">${svg}</div>`;
}

export async function rectangleSizeUpdate(
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
  const rectValues = getObjectValuesForDevice(
    properties as RectangleValues,
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
export const rectangleMeta = {
  name: "Rectangle",
  description: "Add rectangle object",
  icon: svg,
  supportWidthResize: true,
  supportHeightResize: true,
};

const svgRectWithCornerRadius = (
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
