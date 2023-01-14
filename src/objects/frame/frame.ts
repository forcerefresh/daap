import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "webslider-sdk/lib/objects/objects-register";
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
      properties: [...getCommonObjectPropertiesDefinition()],
      values: { ...getCommonPropertiesValues() },
      valuesMetadata: { ...getCommonPropertiesMetadataValues() },
    },
    transformDefinition: {
      properties: [...getTransformObjectPropertiesDefinition()],
      values: { ...getTransformPropertiesValues() },
      valuesMetadata: {},
    },
  };
}

export function getFrameHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
}) {
  const { object, calculatedObjectSize, isPlayer } = props;
  /*if (!isPlayer) {
    return getObjectPlaceholder(`FRAME<br/>(placeholder)`);
  }*/

  let style = "";
  style = addCommonPropertiesToStyle(style, object);
  style = addTransformPropertiesToStyle(style, object);
  style += "width: 100%;";
  style += "height: 100%;";

  const html = `<div class="object-content" style="${style}"></div>`;

  return html;
}

export async function frameSizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize, className } = props;

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  objectWrapperEl.style.width = calculatedObjectSize.width;
  objectWrapperEl.style.height = calculatedObjectSize.height;
  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  objectEl.style.width = calculatedObjectSize.width;
  objectEl.style.height = calculatedObjectSize.height;
}

export const frameMeta = {
  name: "FRAME",
  description: "Add frame",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
