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
  const trianglifyProperties = object.definition.values as TrianglifyValues;
  return `<div class="object-content object-content-${object.id}"></div>`;
}

export function trianglifyObject_Start(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}) {
  const { calculatedObjectSize, className } = props;
  let trianglifyEl: HTMLElement;
  let objectEl: HTMLElement;

  objectEl = document.getElementsByClassName(className)[0] as HTMLElement;
  trianglifyEl = document.createElement("div");
  // trianglifyEl.className = "trianglify";
  trianglifyEl.style.position = "absolute";
  trianglifyEl.style.top = "0";
  trianglifyEl.style.left = "0";
  objectEl.appendChild(trianglifyEl);

  const trConfig = {
    width: calculatedObjectSize.width.slice(0, -2),
    height: calculatedObjectSize.height.slice(0, -2),
    cellSize: props.values.cellSize,
    variance: props.values.variance / 100,
    seed: props.values.seed,
    xColors: props.values.colorsX.map(colorToString),
    yColors: props.values.colorsY.map(colorToString),
    fill: props.values.fill,
    strokeWidth: props.values.strokeWidth,
    colorFunction: (trianglify as any).colorFunctions.interpolateLinear(0.5),
  };

  if (props.values.colorsSG === "match") {
    trConfig.xColors = props.values.colors.map(colorToString);
    trConfig.yColors = "match" as any;
  }

  const pattern = trianglify(trConfig as any) as any;
  trianglifyEl.appendChild(pattern.toSVG());
}

export const trianglifyMeta = {
  name: "TRIANGLIFY",
  description: "Add Trianglify",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
