import {
  ICheckboxInput,
  IColorInput,
  IInputMetadataValues,
  InputType,
  INumberInput,
  ISVGCustomColorsInput,
  ISVGInput,
  ISVGValue,
} from "../../inputs/types";
import { createCommonObject } from "../create-object-factory";
import { ICommonObjectProperties, IObject } from "../types";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../objects-factory";
import arrowIcon from "./arrow-icon.svg";
import { convertTimeUnitToMs, rgbColor2cssRgba } from "../../utils/utils";
import { getObjectPlaceholder } from "../object-helpers";
import {
  FormType,
  IFormGroupItem,
} from "../../utils/form-layout/i-form-layout";
import { RGBColor } from "react-color";
import { DelayPropertiesTuple } from "../delay/delay";
import { replaceColors } from "../../export/export-html";

const ARROW = "arrow";

export type ArrowPropertiesTuple = [
  ISVGInput<"svg">,
  ICheckboxInput<"keepAspectRatio">,
  IFormGroupItem<[IColorInput<"fill">, IColorInput<"stroke">]>,
  IFormGroupItem<[IColorInput<"hoverFill">, IColorInput<"hoverStroke">]>,
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
  hasHover: boolean;
  hoverFill: RGBColor;
  hoverStroke: RGBColor;
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
          source: `<svg height="100" width="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
      </svg>`,
          colors: [],
          colorsType: "unique",
          disableCustomColors: false,
        },
    keepAspectRatio: true,
    hasHover: true,
    hasStrokeFill: true,
    fill: { r: 255, g: 255, b: 255, a: 1 },
    stroke: { r: 0, g: 0, b: 0, a: 0 },
    hoverFill: { r: 255, g: 255, b: 255, a: 1 },
    hoverStroke: { r: 0, g: 0, b: 0, a: 0 },
    hoverTransitionDuration: 500,
  };

  const valuesMetadata: { [key: string]: IInputMetadataValues } = {
    fill: { exportForWizard: false, disabled: false },
    stroke: { exportForWizard: false, disabled: false },
    hoverFill: { exportForWizard: false, disabled: false },
    hoverStroke: { exportForWizard: false, disabled: false },
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

export function getArrowHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
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
      ? `fill: ${rgbColor2cssRgba(svgValues.fill)};
      `
      : "";
  const stroke =
    !svgValuesMetadata["stroke"].disabled && svgValues.hasStrokeFill
      ? `stroke: ${rgbColor2cssRgba(svgValues.stroke)};
      `
      : "";

  // hover START>>
  const hoverFill =
    !svgValuesMetadata["hoverFill"].disabled && svgValues.hasHover
      ? `fill: ${rgbColor2cssRgba(svgValues.hoverFill)};
     `
      : "";
  const hoverStroke =
    !svgValuesMetadata["hoverStroke"].disabled && svgValues.hasHover
      ? `stroke: ${rgbColor2cssRgba(svgValues.hoverStroke)};
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
      width: 100%; 
      height: 100%;
      transition-duration: ${svgValues.hoverTransitionDuration}ms;
    }
    .object-content-${object.id}:hover svg {
      ${hoverFill}
      ${hoverStroke}
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
