import { ITextInput, InputType } from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import {
  GetHtmlFuncPropsType,
  PreloadOrder,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import svg from "./free-draw.svg";
import { getObjectPlaceholder } from "webslider-sdk/lib/objects/object-helpers";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import {
  addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import { IBezier, Points } from "./types";
import { bezierArr2Path } from "./utils";

export const FREE_DRAW = "free-draw";

export interface FreeDrawValues {
  lines: {
    points: Points;
    bezier: IBezier[];
    color: string;
    strokeWidth: string;
  }[];
}

export type FreeDrawPropertiesTuple = [ITextInput<"strokeWidth">];

export function createFreeDrawObject(initialValue?: {
  [key: string]: any;
}): Omit<
  IObject<FreeDrawPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(FREE_DRAW);

  console.log();
  const properties: FreeDrawPropertiesTuple = [
    {
      inputType: InputType.TEXT,
      displayName: "Strike width",
      propertyName: "strokeWidth",
      value: "1",
      defaultValue: "1",
    },
  ];

  const values: FreeDrawValues = {
    lines: initialValue?.lines ?? [],
    // strokeWidth: initialValue?.strokeWidth ?? "1",
    // color: initialValue?.color ?? "black",
    // paths: initialValue?.paths ?? [],
  };

  return {
    ...object,
    definition: {
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

export function getFreeDrawHtml(props: GetHtmlFuncPropsType) {
  const { object, isPlayer, deviceType } = props;
  const freeDrawValues = object.definition.values as FreeDrawValues;

  console.log(freeDrawValues);
  if (!isPlayer) {
    if (!freeDrawValues.lines || freeDrawValues.lines.length === 0) {
      return getObjectPlaceholder(`FREE DRAW<br/>(placeholder)`);
    }
  }

  let pathsHtml = "";
  freeDrawValues.lines.forEach((line) => {
    const d = bezierArr2Path(line.bezier);
    pathsHtml += `<path stroke-width="${line.strokeWidth}px" stroke="${line.color}" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
  });

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  style += "width: 100%;";
  style += "height: 100%;";
  return `
<div class="object-content object-content-${object.id}" style="${style}">
  <svg fill="none"  style="width: 100%; height: 100%; overflow:visible;">
  ${pathsHtml}
  </svg>
</div>`;
}

export async function freeDrawSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {}

export const freeDrawMeta = {
  name: "Free draw",
  description: "Free hand draw",
  preloadOrder: PreloadOrder.MIDDLE,
  icon: svg,
  //isEditable: false, // not needed default is false
};
