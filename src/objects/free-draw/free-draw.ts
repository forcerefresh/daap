import {
  IColorInput,
  INumberInput,
  ITextInput,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
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
import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import { convertRGBColor2CSSStyle } from "webslider-sdk/lib/utils/utils";

export const FREE_DRAW = "free-draw";

export interface FreeDrawValues {
  lines: {
    points: Points;
    bezier: IBezier[];
    color: RGBColor;
    strokeWidth: string;
  }[];
  strokeWidth: number;
  color: RGBColor;
}

export type FreeDrawPropertiesTuple = [
  INumberInput<"strokeWidth">,
  IColorInput<"color">
];

export function createFreeDrawObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(FREE_DRAW);

  const values: FreeDrawValues = {
    lines: initialValue?.lines ?? [],
    strokeWidth: initialValue?.strokeWidth ?? 5,
    color: initialValue?.color ?? { r: 255, b: 255, g: 255, a: 1 },
  };

  object.properties = values;

  return object;
}

export function getFreeDrawForm(): FreeDrawPropertiesTuple {
  const form: FreeDrawPropertiesTuple = [
    {
      inputType: InputType.NUMBER,
      displayName: "Line",
      propertyName: "strokeWidth",
      value: 1,
      defaultValue: 1,
    },
    {
      inputType: InputType.COLOR,
      displayName: "Line color",
      propertyName: "color",
      value: { r: 255, b: 255, g: 255, a: 1 },
      defaultValue: { r: 255, b: 255, g: 255, a: 1 },
    },
  ];

  return form;
}

export function getFreeDrawHtml(props: GetHtmlFuncPropsType) {
  const { object, isPlayer, deviceType } = props;
  const freeDrawValues = object.properties as FreeDrawValues;

  // console.log(freeDrawValues);
  if (!isPlayer) {
    if (!freeDrawValues.lines || freeDrawValues.lines.length === 0) {
      return getObjectPlaceholder(`FREE DRAW<br/>(placeholder)`);
    }
  }

  let pathsHtml = "";
  freeDrawValues.lines.forEach((line) => {
    const d = bezierArr2Path(line.bezier);
    pathsHtml += `<path stroke-width="${
      freeDrawValues.strokeWidth
    }px" stroke="${
      convertRGBColor2CSSStyle(freeDrawValues.color).backgroundColor
    }" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
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
