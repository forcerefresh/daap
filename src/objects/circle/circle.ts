import { RGBColor } from "react-color";
import {
  IButtonGroupInput,
  ICheckboxInput,
  IColorInput,
  ICornerRadiusInput,
  ICornerRadiusValue,
  InputType,
  INumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import svg from "./circle-icon.svg";
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

export const CIRCLE = "io.forcerefresh.circle.object";

export interface CircleValues {
  strokeWidth: string;
  strokeColor: RGBColor;
  fillColor?: RGBColor;
  type?: "circle" | "ellipse";
}

export type CirclePropertiesTuple = [
  INumberInput<"strokeWidth">,
  IColorInput<"strokeColor">,
  IColorInput<"fillColor">,
  IButtonGroupInput<"type">
];

export function createCircleObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(CIRCLE);

  const values: CircleValues = {
    strokeWidth: initialValue?.strokeWidth ?? "5",
    strokeColor: initialValue?.strokeColor ?? { r: 255, g: 255, b: 255, a: 1 },
    fillColor: initialValue?.fillColor ?? undefined,
    type: initialValue?.type ?? "ellipse",
  };

  object.properties = values;

  return object;
}

export function getCircleObjectForm(): CirclePropertiesTuple {
  const form: CirclePropertiesTuple = [
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
      displayName: "Fill color",
      propertyName: "fillColor",
      inputType: InputType.COLOR,
      value: { r: 255, g: 255, b: 255, a: 0.1 },
      defaultValue: { r: 255, g: 255, b: 255, a: 0.1 },
    },
    {
      displayName: "Type",
      propertyName: "type",
      inputType: InputType.BUTTON_GROUP_INPUT,
      value: "circle",
      defaultValue: "circle",
      options: [
        { label: "Circle", value: "circle" },
        { label: "Ellipse", value: "ellipse" },
      ],
    },
  ];

  return form;
}

export function getCircleHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const circleValues = getObjectValuesForDevice(
    object.properties as CircleValues,
    deviceType
  );

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);

  let element = "";

  if (circleValues.type === "ellipse") {
    const cx = parseFloat(calculatedObjectSize.width) / 2;
    const cy = parseFloat(calculatedObjectSize.height) / 2;
    const rx = parseFloat(calculatedObjectSize.width) / 2;
    const ry = parseFloat(calculatedObjectSize.height) / 2;
    element = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke-width="${
      circleValues.strokeWidth
    }" stroke="${
      convertRGBColor2CSSStyle(circleValues.strokeColor).backgroundColor
    }" fill="${
      convertRGBColor2CSSStyle(circleValues.fillColor).backgroundColor
    }" />`;
  } else {
    const minSize = Math.min(
      parseFloat(calculatedObjectSize.width),
      parseFloat(calculatedObjectSize.height)
    );
    element = `<circle cx="${minSize / 2}" cy="${minSize / 2}" r="${
      minSize / 2
    }" stroke-width="${circleValues.strokeWidth}" stroke="${
      convertRGBColor2CSSStyle(circleValues.strokeColor).backgroundColor
    }" fill="${
      convertRGBColor2CSSStyle(circleValues.fillColor).backgroundColor
    }" />`;
  }

  const svg = `
    <svg viewBox="0 0 ${object.width} ${object.height}" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${element}
    </svg>`;

  return `<div class="object-content object-content-${object.id}" style="${style}">${svg}</div>`;
}

export async function circleSizeUpdate(
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
  const circleValues = getObjectValuesForDevice(
    properties as CircleValues,
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
export const circleMeta = {
  name: "Circle",
  description: "Add circle object",
  icon: svg,
  supportWidthResize: true,
  supportHeightResize: true,
};
