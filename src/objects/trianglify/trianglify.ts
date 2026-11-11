import {
  IColorArrayInput,
  IColorInput,
  InputType,
  INumberInput,
  ISliderInput,
  ITextInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import svg from "./trianglify-icon.svg?raw";
import trianglify from "trianglify";
import {
  FormType,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "webslider-sdk/lib/form/i-form-layout";
import { RGBColor } from "react-color";
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
      >,
    ]
  >,
  INumberInput<"cellSize">,
  ISliderInput<"variance">,
  ITextInput<"seed">,
  INumberInput<"strokeWidth">,
  IFormSwitchGroupItem<
    "strokeColorSG",
    [IFormSwitchGroup<[]>, IFormSwitchGroup<[IColorInput<"strokeColor">]>]
  >,
];

export function createTrianglifyObject(
  _initialValue?: {
    [key: string]: any;
  },
  _commonProperties?: {
    hasOverflowProperty: boolean;
  },
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
  } as unknown as Omit<IObject<TrianglifyPropertiesTuple>, keyof ICommonObjectProperties | "layerId">;
}

export function getTrianglifyHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
}) {
  const { object, calculatedObjectSize } = props;

  const trValues = (object as any).definition.values as TrianglifyValues;

  const trConfig = {
    width: parseInt(`${calculatedObjectSize.width!}`) || 1,
    height: parseInt(`${calculatedObjectSize.height!}`) || 1,
    cellSize: trValues.cellSize,
    variance: trValues.variance / 100,
    seed: trValues.seed,
    xColors: trValues.colorsX.map(colorToString),
    yColors: trValues.colorsY.map(colorToString),
    fill: trValues.fill,
    strokeWidth: trValues.strokeWidth,
    colorFunction: (trianglify as any).colorFunctions.interpolateLinear(0.5),
  };

  if (trValues.colorsSG === "match") {
    trConfig.xColors = trValues.colors.map(colorToString);
    trConfig.yColors = "match" as any;
  }

  const pattern = trianglify(trConfig as any) as any;

  const svg = pattern.toSVG() as SVGElement;

  let css = "";
  if (trValues.strokeColorSG === "color") {
    css = `
      .object-content-${object.id} svg > path {
        stroke: ${colorToString(trValues.strokeColor)};
      }
    `;
  }

  css += `.object-content-${object.id} {
    ${addCommonPropertiesToStyle("", object)}
    ${addTransformPropertiesToStyle("", object)}   
  }`;
  return (
    `<style>${css}</style><div class='object-content object-content-${object.id}'>` +
    svg.outerHTML +
    "</div>"
  );
}

export async function trianglifySizeUpdate(_props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<void> {
}

export const trianglifyMeta = {
  name: "TRIANGLIFY",
  description: "Add Trianglify",
  icon: svg,
};

function colorToString(color: RGBColor) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
