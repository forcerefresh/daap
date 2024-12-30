import { RGBColor } from "react-color";
import {
  ICheckboxInput,
  IColorArrayInput,
  IColorInput,
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
import svg from "./blob-icon.svg";
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
  GetFontsFuncPropsType,
  GetFontsFuncReturnType,
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
import { _shuffle, blobGenerator } from "./blob-utils";
import { convertRGBColor2CSSStyle } from "webslider-sdk/lib/utils/utils";

export const BLOB = "io.forcerefresh.blob.object";

export interface BlobValues {
  strokeWidth: string;
  strokeColor: RGBColor;
  fillColor?: RGBColor;
  growth: number;
  edges: number;
  seed: number;
}

export type TextPropertiesTuple = [
  IUnitsNumberInput<"strokeWidth">,
  IColorInput<"strokeColor">,
  IColorInput<"fillColor">,
  INumberInput<"growth">,
  INumberInput<"edges">,
  INumberInput<"seed">
];

export function createBlobObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(BLOB);

  let maxRandomValue = _shuffle([99, 999, 9999, 99999, 999999])[0];
  let seed = Math.floor(Math.random() * maxRandomValue);

  const values: BlobValues = {
    strokeWidth: "5px",
    strokeColor: { r: 255, g: 255, b: 255, a: 1 },
    fillColor: undefined,
    growth: 6,
    edges: 8,
    seed,
  };

  object.properties = values;

  return object;
}

export function getBlobObjectForm(): TextPropertiesTuple {
  const form: TextPropertiesTuple = [
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
      propertyName: "growth",
      inputType: InputType.NUMBER,
      value: 8,
      defaultValue: 8,
    },
    {
      displayName: "Edges",
      propertyName: "edges",
      inputType: InputType.NUMBER,
      value: 8,
      defaultValue: 8,
    },
    {
      displayName: "Seed",
      propertyName: "seed",
      inputType: InputType.NUMBER,
      value: 1234567890,
      defaultValue: 123456789,
    },
  ];

  return form;
}

export function getBlobHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const blobValues = getObjectValuesForDevice(
    object.properties as BlobValues,
    deviceType
  );

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);

  const { path, seedValue } = blobGenerator({
    size: object.width ?? 100,
    growth: blobValues.growth,
    edges: blobValues.edges,
    seed: blobValues.seed,
  });

  console.log(path);

  const svg = `
    <svg viewBox="0 0 ${object.width} ${
    object.width
  }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <path  d="${path}" stroke-width="${blobValues.strokeWidth}" stroke="${
    convertRGBColor2CSSStyle(blobValues.strokeColor).backgroundColor
  }" fill="${
    convertRGBColor2CSSStyle(blobValues.fillColor).backgroundColor
  }"></path>
     </svg>`;
  return `<div class="object-content object-content-${object.id}" style="${style}">${svg}</div>`;
}

export async function blobSizeUpdate(
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
    properties as BlobValues,
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
export const blobMeta = {
  name: "Blob",
  description: "Add blob object",
  icon: svg,
  supportWidthResize: true,
};
