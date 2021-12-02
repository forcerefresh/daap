import { InputType } from "../../inputs/types";
import { FormType } from "../../utils/form-layout/form-layout";
import { ITrianglifyEffect, trianglifyPhoto } from "./trianglify.types";

interface IEffectDefinition {
  id: string;
  name: string;
  form: IFormItem[];
}
interface IFormSwitchGroupItem {
  type: FormType.SWITCH_GROUP;
  displayName: string;
  propertyName: string;
  groups: { groupName: string; groupValue: string; elements: IFormItem[] }[];
}

interface IFormInputItem {
  type?: FormType.INPUT;
  inputType: InputType;
  displayName: string;
  helperText?: string;
  propertyName: string;
  inputProps?: {
    [key: string]: any;
  };
}

type IFormItem = IFormSwitchGroupItem | IFormInputItem;

export const trianlifyDefinition: IEffectDefinition = {
  id: trianglifyPhoto,
  name: "Trianglify",
  form: [
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
            },
            {
              displayName: "Gradient Y",
              propertyName: "colorsY",
              inputType: InputType.COLOR_ARRAY,
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
      inputProps: {
        min: 30,
      },
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
    },
    {
      displayName: "Seed",
      helperText:
        "Seeds random generator. Note: Empty value produce random triangles on every execution",
      propertyName: "seed",
      inputType: InputType.TEXT,
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
            },
          ],
        },
      ],
    },
  ],
};

export const trianglifyDefaults: ITrianglifyEffect = {
  id: trianglifyPhoto,
  hasDelay: false,
  hasDuration: true,
  hasEase: false,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  // specific this effect
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
