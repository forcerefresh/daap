import {
  InputType,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "webslider-sdk/lib/objects/objects-register";
import svg from "./frame-icon.svg";
import {
  addCommonPropertiesToStyle,
  convertTimeUnitToMs,
} from "../../utils/utils";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";

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
  style += addCommonPropertiesToStyle(style, object);
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
  const els = document.getElementsByClassName(className);
  const div = els[0] as HTMLDivElement;
  const parent = div.parentNode! as HTMLDivElement;
  parent.style.width = calculatedObjectSize.width;
  parent.style.height = calculatedObjectSize.height;
  parent.style.left = calculatedObjectSize.left;
  parent.style.top = calculatedObjectSize.top;

  div.style.width = calculatedObjectSize.width;
  div.style.height = calculatedObjectSize.height;
}

export const frameMeta = {
  name: "FRAME",
  description: "Add frame",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
