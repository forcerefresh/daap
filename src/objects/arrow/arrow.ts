import {
  ICheckboxInput,
  IColorInput,
  IInputMetadataValues,
  InputType,
  INumberInput,
  ISVGCustomColorsInput,
  ISVGInput,
  ISVGValue,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "webslider-sdk/lib/objects/objects-register";
import arrowIcon from "./arrow-icon.svg";
import { FormType, IFormGroupItem } from "webslider-sdk/lib/form/i-form-layout";
import { RGBColor } from "react-color";
import { replaceColors } from "../../export/export-html";
import { convertRGBColor2RGBAString } from "webslider-sdk/lib/utils/utils";

const ARROW = "arrow";

export type ArrowPropertiesTuple = [
  ISVGInput<"svg">,
  ICheckboxInput<"keepAspectRatio">,
  IFormGroupItem<
    [IColorInput<"fill">, IColorInput<"stroke">, IColorInput<"color">]
  >,
  IFormGroupItem<
    [
      IColorInput<"hoverFill">,
      IColorInput<"hoverStroke">,
      IColorInput<"hoverColor">
    ]
  >,
  INumberInput<"hoverTransitionDuration">,
  IFormGroupItem<[ISVGCustomColorsInput<"svg">]>
];

export interface ArrowValues {
  svg: ISVGValue;
  hasCustomColors: boolean;
  keepAspectRatio: boolean;
  hasStrokeFill: boolean;
  fill: RGBColor;
  stroke: RGBColor;
  color: RGBColor;
  hasHover: boolean;
  hoverFill: RGBColor;
  hoverStroke: RGBColor;
  hoverColor: RGBColor;
  hoverTransitionDuration: number;
}

export function createArrowObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<ArrowPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(ARROW);

  const properties: ArrowPropertiesTuple = [
    {
      displayName: "SVG",
      propertyName: "svg",
      inputType: InputType.SVG_INPUT,
      value: { source: "" },
      defaultValue: { source: "" },
    },
    {
      displayName: "Aspect ratio",
      propertyName: "keepAspectRatio",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
    },
    {
      displayName: "Fill and Stroke",
      type: FormType.GROUP,
      propertyName: "hasStrokeFill",
      optional: true,
      elements: [
        {
          displayName: "Fill",
          propertyName: "fill",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
          optional: true,
        },
        {
          displayName: "Stroke",
          propertyName: "stroke",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
          optional: true,
        },
        {
          displayName: "Color",
          propertyName: "color",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
          optional: true,
        },
      ],
    },

    {
      displayName: "Hover",
      type: FormType.GROUP,
      propertyName: "hasHover",
      optional: true,
      elements: [
        {
          displayName: "Fill",
          propertyName: "hoverFill",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
          optional: true,
        },
        {
          displayName: "Stroke",
          propertyName: "hoverStroke",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
          optional: true,
        },
        {
          displayName: "Color",
          propertyName: "hoverColor",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
          optional: true,
        },
      ],
    },
    {
      displayName: "Hover transition duration",
      propertyName: "hoverTransitionDuration",
      inputType: InputType.NUMBER,
      value: 500,
      defaultValue: 500,
    },
    {
      displayName: "Custom colors",
      type: FormType.GROUP,
      propertyName: "hasCustomColors",
      optional: true,
      elements: [
        {
          displayName: "",
          duplicate: "1",
          propertyName: "svg",
          inputType: InputType.SVG_CUSTOM_COLORS,
          value: { source: "" },
          defaultValue: { source: "" },
        },
      ],
    },
  ];

  const values: ArrowValues = {
    hasCustomColors: false,
    svg: initialValue?.svg
      ? initialValue.svg
      : {
          source: `<svg width="72" height="72" version="1.1" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path d="m21.975 66.924 0.41337-0.35432 30.806-26.771c1.0433-0.90548 1.6929-2.2637 1.6929-3.7794 0-1.5157-0.66927-2.8739-1.6929-3.7794l-30.747-26.751-0.51179-0.45274c-0.49211-0.33463-1.0826-0.53148-1.7125-0.53148-1.7125 0-3.1101 1.4566-3.1101 3.2676v56.455c0 1.811 1.3976 3.2676 3.1101 3.2676 0.64958 0 1.2598-0.21652 1.7519-0.57084z" fill="currentColor" stroke-width=".070312"></path></svg>`,
          colors: [],
          colorsType: "unique",
          disableCustomColors: false,
        },
    keepAspectRatio: true,
    hasHover: true,
    hasStrokeFill: true,
    fill: { r: 255, g: 255, b: 255, a: 1 },
    stroke: { r: 0, g: 0, b: 0, a: 0 },
    color: { r: 255, g: 255, b: 255, a: 1 },
    hoverFill: { r: 255, g: 255, b: 255, a: 1 },
    hoverColor: { r: 255, g: 255, b: 255, a: 1 },
    hoverStroke: { r: 0, g: 0, b: 0, a: 0 },
    hoverTransitionDuration: 500,
  };

  const valuesMetadata: { [key: string]: IInputMetadataValues } = {
    fill: { exportForWizard: false, disabled: false },
    stroke: { exportForWizard: false, disabled: false },
    color: { exportForWizard: false, disabled: false },
    hoverFill: { exportForWizard: false, disabled: false },
    hoverStroke: { exportForWizard: false, disabled: false },
    hoverColor: { exportForWizard: false, disabled: false },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ARROW,
      properties,
      values,
      valuesMetadata,
    },
  };
}

export function getArrowHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
}) {
  const { object, calculatedObjectSize } = props;

  const svgValues = object.definition.values as ArrowValues;
  const svgValuesMetadata = object.definition.valuesMetadata;

  const svgCode =
    svgValues.svg.colors && svgValues.hasCustomColors
      ? replaceColors(svgValues.svg.source, svgValues.svg.colors)
      : svgValues.svg.source;

  const svgWidth = 24;
  const svgHeight = 24;

  const w = parseInt(calculatedObjectSize.width as string);
  const h = parseInt(calculatedObjectSize.height as string);

  let scaleX = 1;
  let scaleY = 1;
  scaleY = svgValues.keepAspectRatio ? 1 : h / w;

  const fill =
    !svgValuesMetadata["fill"].disabled && svgValues.hasStrokeFill
      ? `fill: ${convertRGBColor2RGBAString(svgValues.fill)};
      `
      : "";
  const stroke =
    !svgValuesMetadata["stroke"].disabled && svgValues.hasStrokeFill
      ? `stroke: ${convertRGBColor2RGBAString(svgValues.stroke)};
      `
      : "";
  const color =
    !svgValuesMetadata["color"].disabled && svgValues.hasStrokeFill
      ? `color: ${convertRGBColor2RGBAString(svgValues.color)};
      `
      : "";

  // hover START>>
  const hoverFill =
    !svgValuesMetadata["hoverFill"].disabled && svgValues.hasHover
      ? `fill: ${convertRGBColor2RGBAString(svgValues.hoverFill)};
     `
      : "";
  const hoverStroke =
    !svgValuesMetadata["hoverStroke"].disabled && svgValues.hasHover
      ? `stroke: ${convertRGBColor2RGBAString(svgValues.hoverStroke)};
     `
      : "";
  const hoverColor =
    !svgValuesMetadata["hoverColor"].disabled && svgValues.hasHover
      ? `color: ${convertRGBColor2RGBAString(svgValues.hoverColor)};
       `
      : "";
  // hover END <<
  const css = `
    <style>
    .object-content-${object.id}{
      transform: scaleX(${scaleX}) scaleY(${scaleY});
      transform-origin: top left;
      ${svgValues.keepAspectRatio ? "width:100%;height:100%;" : ""}
     
    }
    .object-content-${object.id} svg {
      ${fill}
      ${stroke}
      ${color}
      width: 100%; 
      height: 100%;
      transition-duration: ${svgValues.hoverTransitionDuration}ms;
    }
    .object-content-${object.id}:hover svg {
      ${hoverFill}
      ${hoverStroke}
      ${hoverColor}
    }
    </style>`;

  //if (svgValues.svg) {
  return `${css}<div class="object-content object-content-${object.id}">${svgCode}</div>`;
  //}
  //return ``;
}

export async function arrowSizeUpdate(props: {
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

export const arrowMeta = {
  name: "ARROW",
  description: "Add navigation arrow",
  preloadOrder: PreloadOrder.FIRST,
  icon: arrowIcon,
};
