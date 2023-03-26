import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import {
  GetHtmlFuncPropsType,
  PreloadOrder,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import svg from "./frame-icon.svg";
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
} from "webslider-sdk/lib/objects/transform-properties";
import {
  addCommonStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";

export const FRAME = "frame";

export type FramePropertiesTuple = [];

export interface FrameValues {}

export function createFrameObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<FramePropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(FRAME);

  const properties: FramePropertiesTuple = [];

  const values = {};

  return {
    ...object,
    definition: {
      id: uuid(),
      type: FRAME,
      properties,
      values,
      valuesMetadata: {},
    },
    commonStyleDefinition: {
      properties: [...getCommonObjectPropertiesDefinition(true)],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
    transformDefinition: {
      properties: [...getTransformObjectPropertiesDefinition(true)],
      values: { ...getTransformPropertiesValues() },
      valuesMetadata: {},
    },
  };
}

export function getFrameHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, isPlayer, deviceType } = props;
  /*if (!isPlayer) {
    return getObjectPlaceholder(`FRAME<br/>(placeholder)`);
  }*/

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  style += "width: 100%;";
  style += "height: 100%;";
  style += "box-sizing: border-box;";

  const html = `<div class="object-content" style="${style}"></div>`;

  return html;
}

export async function frameSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    values,
    valuesMetadata,
    commonStyleDefinition,
    transformDefinition,
    className,
    deviceType,
  } = props;

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  objectWrapperEl.style.width = calculatedObjectSize.width;
  objectWrapperEl.style.height = calculatedObjectSize.height;
  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  objectEl.style.width = calculatedObjectSize.width;
  objectEl.style.height = calculatedObjectSize.height;

  // update style
  const objectContentEl = objectEl.getElementsByClassName(
    "object-content"
  )[0] as HTMLElement;
  addCommonStyleToObjectElementContent(
    objectContentEl,
    commonStyleDefinition,
    deviceType
  );
}

export const frameMeta = {
  name: "Frame",
  description: "Add Frame Object",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
