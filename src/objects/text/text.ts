import { RGBColor } from "react-color";
import {
  ICheckboxInput,
  IColorInput,
  IFontSelectInput,
  IFontSelectInputValue,
  InputType,
  ISelectInput,
  ITextAreaInput,
  IUnitsNumberInput,
} from "../../inputs/types";
import { nl2br } from "../../utils/doom-utils/common";
import { ICommonObjectProperties, IObject } from "../types";
import { v4 as uuid } from "uuid";
import { createCommonObject } from "../create-object-factory";
import svg from "./text-icon.svg";

export const TEXT = "text";

export interface TextValues {
  text: string;
  autoHeight: boolean;
  font: IFontSelectInputValue;
  color: RGBColor;
  fontSize: string;
  weight: string;
  preload: boolean;
}

export type TextPropertiesTuple = [
  ITextAreaInput<"text">,
  ICheckboxInput<"autoHeight">,
  IFontSelectInput<"font">,
  IColorInput<"color">,
  IUnitsNumberInput<"fontSize">,
  ISelectInput<"weight">,
  ICheckboxInput<"preload">
];

export function createTextObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<TextPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(TEXT);

  const properties: TextPropertiesTuple = [
    {
      displayName: "Text",
      propertyName: "text",
      inputType: InputType.TEXTAREA,
      value: (initialValue?.text as string) || "",
      defaultValue: "",
    },
    {
      displayName: "Auto height",
      propertyName: "autoHeight",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
    },

    {
      displayName: "Font",
      propertyName: "font",
      inputType: InputType.FONT_SELECT,
      value: (initialValue?.font as IFontSelectInputValue) || {
        fontFamily: "Arial",
        source: "system-fonts",
      },
      defaultValue: {
        fontFamily: "Arial",
        source: "system-fonts",
      },
    },
    {
      displayName: "Color",
      propertyName: "color",
      inputType: InputType.COLOR,
      value: { r: 255, g: 255, b: 255, a: 1 },
      defaultValue: { r: 255, g: 255, b: 255, a: 1 },
    },
    {
      displayName: "Font size",
      placeholderText: "Enter font size",
      allowedUnits: ["px", "em", "%"],
      propertyName: "fontSize",
      inputType: InputType.UNITS_NUMBER,
      value: initialValue?.fontSize || "1em",
      defaultValue: "1em",
    },
    {
      displayName: "Weight",
      propertyName: "weight",
      inputType: InputType.SELECT,
      value: "400",
      defaultValue: "400",
      options: [
        { value: "100", label: "100	Thin" },
        { value: "200", label: "200	Extra Light" },
        { value: "300", label: "300	Light" },
        { value: "400", label: "400	Normal" },
        { value: "500", label: "500	Medium" },
        { value: "600", label: "600	Semi Bold" },
        { value: "700", label: "700	Bold" },
        { value: "800", label: "800	Extra Bold" },
        { value: "900", label: "900	Black" },
        { value: "950", label: "950	Extra Black" },
      ],
    },
    {
      displayName: "Preload fonts",
      propertyName: "preload",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
      inputProps: { disabled: true },
    },
  ];

  const values: TextValues = {
    text: (initialValue?.text as string) || "",
    autoHeight: false,
    font: (initialValue?.font as IFontSelectInputValue) || {
      fontFamily: "Arial",
      source: "system-fonts",
    },
    color: { r: 255, g: 255, b: 255, a: 1 },
    fontSize: initialValue?.fontSize || "1em",
    weight: "400",
    preload: true, // not visible
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: TEXT,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

export function getTextHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const textProperties = object.definition.values as TextValues;

  let style = "";
  style += "font-family: " + textProperties.font.fontFamily + ";";
  style += "font-size: " + textProperties.fontSize + ";";
  const c = textProperties.color;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += "font-weight: " + textProperties.weight + ";";
  style += "width: " + calculatedObjectSize.width + ";";
  style += "height:" + calculatedObjectSize.height + ";";
  style += "position: absolute;";

  return `<p class="object-content" style="${style}">${nl2br(
    textProperties.text
  )}</p>`;
}

export async function preloadText(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { values } = props;
  const textValues = values as TextValues;
  const p = (window as any).WSFontPreloader.subscribe(
    textValues.font.fontFamily
  );

  try {
    await p;
  } catch (ex) {}

  return textValues.font.fontFamily;
}

export const textMeta = {
  name: "TEXT",
  description: "Add text object",
  icon: svg,
};
