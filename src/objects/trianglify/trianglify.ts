import {
  IColorArrayInput,
  IColorInput,
  InputType,
  INumberInput,
  ISliderInput,
  ITextInput,
} from "../../inputs/types";
import { createCommonObject } from "../create-object-factory";
import { ICommonObjectProperties, IObject } from "../types";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../objects-factory";
import svg from "./trianglify-icon.svg";
import trianglify from "trianglify";
import {
  FormType,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "../../utils/form-layout/i-form-layout";
import { RGBColor } from "react-color";
import { getObjectPlaceholder } from "../object-helpers";

const TRIANGLIFY = "trianglify";

export interface TrianglifyValues {
  colorsSG: "match" | "both";
  colors: RGBColor[];
  colorsX: RGBColor[];
  colorsY: RGBColor[];
  cellSize: number;
  variance: number;
  seed: string;
  fill: boolean;
  strokeWidth: number;
  strokeColorSG: "none" | "color";
  strokeColor: RGBColor;
}

export type TrianglifyPropertiesTuple = [
  IFormSwitchGroupItem<
    "colorsSG",
    [
      IFormSwitchGroup<[IColorArrayInput<"colors">]>,
      IFormSwitchGroup<
        [IColorArrayInput<"colorsX">, IColorArrayInput<"colorsY">]
      >
    ]
  >,
  INumberInput<"cellSize">,
  ISliderInput<"variance">,
  ITextInput<"seed">,
  INumberInput<"strokeWidth">,
  IFormSwitchGroupItem<
    "strokeColorSG",
    [IFormSwitchGroup<[]>, IFormSwitchGroup<[IColorInput<"strokeColor">]>]
  >
];

export function createTrianglifyObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<TrianglifyPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(TRIANGLIFY);

  const properties: TrianglifyPropertiesTuple = [
    {
      type: FormType.SWITCH_GROUP,
      displayName: "Gradients XY",
      propertyName: "colorsSG",
      groups: [
        {
          groupName: "Same",
          groupValue: "match",
          elements: [
            {
              displayName: "Gradient",
              propertyName: "colors",
              inputType: InputType.COLOR_ARRAY,
              value: [
                { r: 255, g: 255, b: 255, a: 1 },
                { r: 0, g: 0, b: 0, a: 1 },
              ],
              defaultValue: [
                { r: 255, g: 255, b: 255, a: 1 },
                { r: 0, g: 0, b: 0, a: 1 },
              ],
            },
          ],
        },
        {
          groupName: "Different",
          groupValue: "both",
          elements: [
            {
              displayName: "Gradient X",
              propertyName: "colorsX",
              inputType: InputType.COLOR_ARRAY,
              value: [
                { r: 255, g: 255, b: 255, a: 1 },
                { r: 0, g: 0, b: 0, a: 1 },
              ],
              defaultValue: [
                { r: 255, g: 255, b: 255, a: 1 },
                { r: 0, g: 0, b: 0, a: 1 },
              ],
            },
            {
              displayName: "Gradient Y",
              propertyName: "colorsY",
              inputType: InputType.COLOR_ARRAY,
              value: [
                { r: 255, g: 255, b: 255, a: 1 },
                { r: 0, g: 0, b: 0, a: 1 },
              ],
              defaultValue: [
                { r: 255, g: 255, b: 255, a: 1 },
                { r: 0, g: 0, b: 0, a: 1 },
              ],
            },
          ],
        },
        /* {
          groupName: "Random",
          groupValue: "random",
          elements: [],
        },*/
      ],
    },
    {
      displayName: "Size",
      helperText: "Average triangle size (min: 30)",
      propertyName: "cellSize",
      inputType: InputType.NUMBER,
      value: 75,
      defaultValue: 75,
    },
    {
      displayName: "Difference",
      helperText: "Higher value produce more difference between triangles",
      propertyName: "variance",
      inputType: InputType.SLIDER_INPUT,
      inputProps: {
        thumbPosition: "top",
        min: 0,
        max: 100,
      },
      value: 75,
      defaultValue: 75,
    },
    {
      displayName: "Seed",
      helperText:
        "Seeds random generator. Note: Empty value produce random triangles on every execution",
      propertyName: "seed",
      inputType: InputType.TEXT,
      value: "qwerty",
      defaultValue: "qwerty",
    },
    /*{
      displayName: "Fill",
      propertyName: "fill",
      inputType: InputType.CHECKBOX,
    },*/
    {
      displayName: "Stroke width",
      propertyName: "strokeWidth",
      inputType: InputType.NUMBER,
      value: 0,
      defaultValue: 0,
    },

    {
      type: FormType.SWITCH_GROUP,
      displayName: "Stroke color",
      propertyName: "strokeColorSG",
      groups: [
        {
          groupName: "Same as gradient",
          groupValue: "none",
          elements: [],
        },
        {
          groupName: "Color",
          groupValue: "color",
          elements: [
            {
              displayName: "Stroke color",
              propertyName: "strokeColor",
              inputType: InputType.COLOR,
              value: { r: 255, g: 255, b: 255, a: 1 },
              defaultValue: { r: 255, g: 255, b: 255, a: 1 },
            },
          ],
        },
      ],
    },
  ];

  const values: TrianglifyValues = {
    colorsSG: "match",
    colors: [
      { r: 255, g: 255, b: 255, a: 1 },
      { r: 0, g: 0, b: 0, a: 1 },
    ],
    colorsX: [
      { r: 255, g: 255, b: 255, a: 1 },
      { r: 0, g: 0, b: 0, a: 1 },
    ],
    colorsY: [
      { r: 255, g: 255, b: 255, a: 1 },
      { r: 0, g: 0, b: 0, a: 1 },
    ],
    cellSize: 75,
    variance: 75,
    seed: "qwerty",
    fill: true,
    strokeWidth: 0,
    strokeColorSG: "none",
    strokeColor: { r: 255, g: 255, b: 255, a: 1 },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: TRIANGLIFY,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

export function getTrianglifyHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties,
  isPlayer: boolean
) {
  const props = object.definition.values as TrianglifyValues;

  const trConfig = {
    width: parseInt(`${calculatedObjectSize.width!}`),
    height: parseInt(`${calculatedObjectSize.height!}`),
    cellSize: props.cellSize,
    variance: props.variance / 100,
    seed: props.seed,
    xColors: props.colorsX.map(colorToString),
    yColors: props.colorsY.map(colorToString),
    fill: props.fill,
    strokeWidth: props.strokeWidth,
    colorFunction: (trianglify as any).colorFunctions.interpolateLinear(0.5),
  };

  if (props.colorsSG === "match") {
    trConfig.xColors = props.colors.map(colorToString);
    trConfig.yColors = "match" as any;
  }

  const pattern = trianglify(trConfig as any) as any;

  const svg = pattern.toSVG() as SVGElement;

  const objectClassname = "object-" + object.id;
  let css = "";
  if (props.strokeColorSG === "color") {
    css = `<style>
      .${objectClassname} svg > path {
        stroke: ${colorToString(props.strokeColor)};
      }</style>`;
  }

  return css + `<div class='${objectClassname}'>` + svg.outerHTML + "<div>";
}

export async function trianglifySizeUpdate(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
  const { id, calculatedObjectSize } = props;
  console.log("trianglifySizeUpdate: id> " + id);
  console.log(calculatedObjectSize);
}

export const trianglifyMeta = {
  name: "TRIANGLIFY",
  description: "Add Trianglify",
  //preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
