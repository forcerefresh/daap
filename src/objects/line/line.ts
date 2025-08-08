import {
  IButtonGroupInput,
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
  PostProcessFuncPropsType,
  PostProcessFuncReturnType,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import svg from "./line.svg?raw";

import { addTransformPropertiesToStyle } from "webslider-sdk/lib/objects/transform-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";

import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import { convertRGBColor2CSSStyle } from "webslider-sdk/lib/utils/utils";
import { cloneDeep } from "lodash-es";

export const LINE = "io.forcerefresh.line.object";

export interface LineValues {
  // points: { x: number; y: number }[];
  strokeWidth?: number;
  strokeColor?: RGBColor;
  // strokeLineJoin?: "miter" | "round" | "bevel";
  strokeLineCap?: "miter" | "round" | "bevel";
  strokeDashArray?: string;

  // fillColor?: RGBColor;
}

export type LinePropertiesTuple = [
  INumberInput<"strokeWidth">,
  IColorInput<"strokeColor">,
  // IButtonGroupInput<"strokeLineJoin">,
  IButtonGroupInput<"strokeLineCap">,
  ITextInput<"strokeDashArray">
  // IColorInput<"fillColor">
];

export function createLineObject(
  initialValue?: Record<string, any>
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(LINE);

  const values: LineValues = {
    // points: initialValue?.points ?? [
    //   { x: 0, y: 0 },
    //   { x: 50, y: 50 },
    // ],
    strokeWidth: initialValue?.strokeWidth ?? 1,
    strokeColor: initialValue?.strokeColor ?? { r: 255, b: 255, g: 255, a: 1 },
    // strokeLineJoin: initialValue?.strokeLineJoin ?? "miter",
    strokeLineCap: initialValue?.strokeLineCap ?? "miter",
    strokeDashArray: initialValue?.strokeDashArray ?? "",

    // fillColor: initialValue?.color ?? { r: 255, b: 255, g: 255, a: 1 },
  };

  object.properties = values;

  return object;
}

export function getLineForm(): LinePropertiesTuple {
  const form: LinePropertiesTuple = [
    {
      inputType: InputType.NUMBER,
      displayName: "Line",
      propertyName: "strokeWidth",
      value: 10,
      defaultValue: 10,
    },
    {
      inputType: InputType.COLOR,
      displayName: "Line color",
      propertyName: "strokeColor",
      value: { r: 255, b: 255, g: 255, a: 1 },
      defaultValue: { r: 255, b: 255, g: 255, a: 1 },
    },
    // {
    //   displayName: "Join",
    //   propertyName: "strokeLineJoin",
    //   inputType: InputType.BUTTON_GROUP_INPUT,
    //   value: "miter",
    //   defaultValue: "miter",
    //   options: [
    //     {
    //       label: "Miter",
    //       value: "miter",
    //     },
    //     {
    //       label: "Round",
    //       value: "round",
    //     },
    //     {
    //       label: "Bevel",
    //       value: "bevel",
    //     },
    //   ],
    // },
    {
      displayName: "Cap",
      propertyName: "strokeLineCap",
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
      inputType: InputType.TEXT,
      displayName: "Dash",
      propertyName: "strokeDashArray",
      value: "",
      defaultValue: "",
      helperText: `Comma separated line length
       and white space (e.g 5,2)`,
    },
    // {
    //   inputType: InputType.COLOR,
    //   displayName: "Fill color",
    //   propertyName: "fillColor",
    //   value: { r: 255, b: 255, g: 255, a: 1 },
    //   defaultValue: { r: 255, b: 255, g: 255, a: 1 },
    // },
  ];

  return form;
}

export function getLineHtml(props: GetHtmlFuncPropsType) {
  const { object, deviceType } = props;
  const lineValues = object.properties as LineValues;

  const b = getBounds(object);

  const nX1 = object.x1! - b.x;
  const nX2 = object.x2! - b.x;
  const nY1 = object.y1! - b.y;
  const nY2 = object.y2! - b.y;

  const path = "M" + nX1 + " " + nY1 + " " + nX2 + " " + nY2;

  // const path =
  //   "M" +
  //   lineValues.points
  //     .map((p) => p.x - b.x + " " + (p.y - b.y)) //+ lineValues.strokeWidth! / 2
  //     .join(" ");

  // const pathsHtml = `<path stroke-width="${lineValues.strokeWidth}px" stroke="${
  //   convertRGBColor2CSSStyle(lineValues.strokeColor).backgroundColor
  // }" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  //   style += "width: 100%;";
  //   style += "height: 100%;";
  //   return `
  // <div class="object-content object-content-${object.id}" style="${style}">
  //   <svg fill="none"  style="width: 100%; height: 100%; overflow:visible;">
  //   ${pathsHtml}
  //   </svg>
  // </div>`;

  const dashattr = lineValues.strokeDashArray
    ? ` stroke-dasharray="${lineValues.strokeDashArray}"`
    : "";
  const svg = `
<svg style="overflow: visible; position: absolute;" viewBox="0 0 ${
    b.width > 1 ? b.width : 1
  } ${
    b.height > 1 ? b.height : 1
  }" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <path  d="${path}" stroke-width="${lineValues.strokeWidth}" stroke="${
    convertRGBColor2CSSStyle(lineValues.strokeColor).backgroundColor
  }" stroke-linecap="${lineValues.strokeLineCap}" ${dashattr}></path>
 </svg>`;
  return `<div class="object-content object-content-${object.id}" style="${style}">${svg}</div>`;

  // fill="${
  //   convertRGBColor2CSSStyle(lineValues.fillColor).backgroundColor
  // }"
}

export async function lineSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {}

export function linePostProcess(
  props: PostProcessFuncPropsType
): PostProcessFuncReturnType {
  const { object, prevObject } = props;

  const newObj = cloneDeep(object);
  const bounds = getBounds(object);

  // newObj.left = bounds.x;
  // newObj.top = bounds.y;
  // newObj.height = bounds.height;
  // newObj.width = bounds.width;

  return newObj;
}

export const lineMeta = {
  name: "Line",
  description: "Line object",
  // preloadOrder: PreloadOrder.MIDDLE,
  icon: svg,
  sizeType: "line", //"rect" | "line"
  //isEditable: false, // not needed default is false
};

export function getBounds(object: IObject) {
  let hMin = 100000;
  let hMax = -100000;
  let vMin = 100000;
  let vMax = -100000;

  const points = [
    { x: object.x1, y: object.y1 },
    { x: object.x2, y: object.y2 },
  ];

  points.forEach((p) => {
    hMin = Math.min(hMin, p.x!);
    hMax = Math.max(hMax, p.x!);
    vMin = Math.min(vMin, p.y!);
    vMax = Math.max(vMax, p.y!);
  });

  return {
    x: hMin,
    width: hMax - hMin,
    y: vMin,
    height: vMax - vMin,
  };
}
