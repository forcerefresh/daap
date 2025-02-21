import { RGBColor } from "react-color";
import {
  IButtonGroupInput,
  ICheckboxInput,
  IColorGradientInput,
  IColorInput,
  ILinearGradientValue,
  InputType,
  INumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import svg from "./polygon-icon.svg";
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
import { getSVGFill } from "../rectangle/shape-utils";

export const POLYGON = "io.forcerefresh.polygon.object";

export interface PolygonValues {
  strokeWidth: string;
  strokeColor: RGBColor;
  strokeLineJoin?: "miter" | "round" | "bevel";
  fill: ILinearGradientValue | RGBColor;
  sides?: number;
  shiftAngle?: boolean;
}

export type PolygonPropertiesTuple = [
  INumberInput<"strokeWidth">,
  IColorInput<"strokeColor">,
  IButtonGroupInput<"strokeLineJoin">,
  IColorGradientInput<"fill">,
  INumberInput<"sides">,
  ICheckboxInput<"shiftAngle">
];

export function createPolygonObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(POLYGON);

  const values: PolygonValues = {
    strokeWidth: initialValue?.strokeWidth ?? "5",
    strokeColor: initialValue?.strokeColor ?? { r: 255, g: 255, b: 255, a: 1 },
    fill: initialValue?.fill ?? undefined,
    strokeLineJoin: initialValue?.strokeLineJoin ?? "miter", // inner radius
    sides: initialValue?.sides ?? 6,
    shiftAngle: initialValue?.shiftAngle ?? false,
  };

  object.properties = values;

  return object;
}

export function getPolygonObjectForm(): PolygonPropertiesTuple {
  const form: PolygonPropertiesTuple = [
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
      displayName: "Join",
      propertyName: "strokeLineJoin",
      inputType: InputType.BUTTON_GROUP_INPUT,
      value: "miter",
      defaultValue: "miter",
      options: [
        {
          label: "Miter",
          value: "miter",
        },
        {
          label: "Round",
          value: "round",
        },
        {
          label: "Bevel",
          value: "bevel",
        },
      ],
    },
    {
      displayName: "Fill",
      propertyName: "fill",
      inputType: InputType.COLOR_GRADIENT,
      value: { r: 255, g: 255, b: 255, a: 0.1 },
      defaultValue: { r: 255, g: 255, b: 255, a: 0.1 },
    },
    {
      displayName: "Sides",
      propertyName: "sides",
      inputType: InputType.NUMBER,
      value: 6,
      defaultValue: 6,
    },
    {
      displayName: "Shift angle",
      propertyName: "shiftAngle",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
    },
  ];

  return form;
}

export function getPolygonHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const polygonValues = getObjectValuesForDevice(
    object.properties as PolygonValues,
    deviceType
  );

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);

  const path = svgPolygonPath(
    parseFloat(calculatedObjectSize.width) / 2,
    parseFloat(calculatedObjectSize.height) / 2,
    polygonValues.sides ?? 6,
    polygonValues.shiftAngle
  );

  const fillObj = getSVGFill(polygonValues.fill, object.id);

  const svg = `
    <svg viewBox="0 0 ${object.width} ${
    object.height
  }" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${fillObj.gradient}   
      <path  d="${path}" stroke-width="${polygonValues.strokeWidth}" stroke="${
    convertRGBColor2CSSStyle(polygonValues.strokeColor).backgroundColor
  }" ${fillObj.fillAttr}  stroke-linejoin="${
    polygonValues.strokeLineJoin
  }"></path>
     </svg>`;
  return `<div class="object-content object-content-${object.id}" style="${style}">${svg}</div>`;
}

export async function polygonSizeUpdate(
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
  const polygonValues = getObjectValuesForDevice(
    properties as PolygonValues,
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
export const polygonMeta = {
  name: "Polygon",
  description: "Add polygon object",
  icon: svg,
  supportWidthResize: true,
  supportHeightResize: true,
};

const svgPolygonPath = (
  w: number,
  h: number,
  sides: number,
  shiftAngle?: boolean
) => {
  const radius = Math.min(w, h);
  const angle = (2 * Math.PI) / sides;
  const points = [];

  const shiftAngleValue = shiftAngle ? angle / 2 : 0;
  for (var i = 0; i < sides; i++) {
    points.push(radius + radius * Math.sin(i * angle + shiftAngleValue));
    points.push(radius - radius * Math.cos(i * angle + shiftAngleValue));
  }

  const pointsStr = "M" + points.join(" ") + "Z"; // + points[0] + " " + points[1];
  return pointsStr;
};
