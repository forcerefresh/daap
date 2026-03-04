import { RGBColor } from "react-color";
import {
  IButtonGroupInput,
  IColorGradientInput,
  IColorInput,
  ICornerRadiusInput,
  ICornerRadiusValue,
  ILinearGradientValue,
  InputType,
  INumberInput,
  ISliderInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import svg from "./star-icon.svg?raw";
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

export const STAR = "io.forcerefresh.star.object";

export interface StarValues {
  strokeWidth: string;
  strokeColor: RGBColor;
  strokeLineJoin?: "miter" | "round" | "bevel";
  fill: ILinearGradientValue | RGBColor;
  points?: number;
  radius?: number;
}

export type StarPropertiesTuple = [
  INumberInput<"strokeWidth">,
  IColorInput<"strokeColor">,
  IButtonGroupInput<"strokeLineJoin">,
  IColorGradientInput<"fill">,
  INumberInput<"points">,
  ISliderInput<"radius">,
];

export function createStarObject(
  initialValue?: Record<string, any>,
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(STAR);

  const values: StarValues = {
    strokeWidth: initialValue?.strokeWidth ?? "5",
    strokeColor: initialValue?.strokeColor ?? { r: 255, g: 255, b: 255, a: 1 },
    fill: initialValue?.fill ?? undefined,
    points: initialValue?.points ?? 5,
    radius: initialValue?.radius ?? 50, // inner radius
    strokeLineJoin: initialValue?.strokeLineJoin ?? "miter", // inner radius
  };

  object.properties = values;

  return object;
}

export function getStarObjectForm(): StarPropertiesTuple {
  const form: StarPropertiesTuple = [
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
      displayName: "Points",
      propertyName: "points",
      inputType: InputType.NUMBER,
      value: 5,
      defaultValue: 5,
    },
    {
      displayName: "Radius",
      propertyName: "radius",
      inputType: InputType.SLIDER_INPUT,
      value: 50,
      defaultValue: 50,
    },
  ];

  return form;
}

export function getStarHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const starValues = getObjectValuesForDevice(
    object.properties as StarValues,
    deviceType,
  );

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);

  const path = svgStarPath(
    parseFloat(calculatedObjectSize.width) / 2,
    parseFloat(calculatedObjectSize.height) / 2,
    starValues.points ?? 5,
    starValues.radius ?? 50,
  );

  const fillObj = getSVGFill(starValues.fill, object.id);

  const svg = `
    <svg viewBox="0 0 ${object.width} ${
      object.height
    }" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${fillObj.gradient}   
      <path  d="${path}" stroke-width="${starValues.strokeWidth}" stroke="${
        convertRGBColor2CSSStyle(starValues.strokeColor).backgroundColor
      }" ${fillObj.fillAttr} stroke-linejoin="${starValues.strokeLineJoin}"></path>
     </svg>`;
  return `<div class="object-content object-content-${object.id}" style="${style}">${svg}</div>`;
}

export async function starSizeUpdate(
  props: UpdateObjectSizeFuncPropsType,
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
  const starValues = getObjectValuesForDevice(
    properties as StarValues,
    deviceType,
  );

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  const objectContentEl = objectEl.getElementsByClassName(
    "object-content",
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
    deviceType,
  );

  const transformProperties = getObjectValuesForDevice(transform);

  if (transformProperties?.transformOriginX) {
    objectWrapperEl.style.transformOrigin = `${
      transformProperties.transformOriginX ?? "left"
    }  ${transformProperties.transformOriginY ?? "top"}`;
  }
}
export const starMeta = {
  name: "Star",
  description: "Add star object",
  icon: svg,
};

const svgStarPath = (
  w: number,
  h: number,
  numPoints: number,
  radius: number,
) => {
  const innerRadius = (w / 100) * radius;
  const outerRadius = w;
  const center = Math.max(innerRadius, outerRadius);
  const angle = Math.PI / numPoints;
  const points = [];

  for (let i = 0; i < numPoints * 2; i++) {
    const r = i & 1 ? innerRadius : outerRadius;
    points.push(center + r * Math.sin(i * angle));
    points.push(center - r * Math.cos(i * angle));
  }

  const pointsStr = "M" + points.join(" ") + "Z"; // + points[0] + " " + points[1];

  return pointsStr;
};
