import {
  ICheckboxInput,
  IColorInput,
  IFontSelectInput,
  IFontSelectInputValue,
  InputType,
  IRichTextAreaInput,
  IUnitsNumberInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "../../webslider-sdk/src/objects/i-object";
import { v4 as uuid } from "uuid";
import { PreloadOrder } from "../../webslider-sdk/src/objects/objects-register";
import svg from "./rich-text-icon.svg";
import {
  addCommonPropertiesToStyle,
  convertTimeUnitToMs,
} from "../../utils/utils";
import { getObjectPlaceholder } from "../../webslider-sdk/src/objects/object-helpers";
import {
  CommonPropertiesTuple,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";
import { RGBColor } from "react-color";

export const RICH_TEXT = "rich_text";

export interface RichTextValues {
  text: string;
  autoHeight: boolean;
  font: IFontSelectInputValue;
  color: RGBColor;
  fontSize: string;
}

export type RichTextPropertiesTuple = [
  IRichTextAreaInput<"text">,
  ICheckboxInput<"autoHeight">,
  IFontSelectInput<"font">,
  IColorInput<"color">,
  IUnitsNumberInput<"fontSize">,
  ...CommonPropertiesTuple
];

export function createRichTextObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<RichTextPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(RICH_TEXT);

  const properties: RichTextPropertiesTuple = [
    {
      displayName: "Text",
      propertyName: "text",
      inputType: InputType.RICH_TEXTAREA,
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
      placeholder: "Enter font size",
      allowedUnits: ["px", "em", "%"],
      propertyName: "fontSize",
      inputType: InputType.UNITS_NUMBER,
      value: initialValue?.fontSize || "1em",
      defaultValue: "1em",
    },
    ...getCommonObjectPropertiesDefinition(),
  ];

  const values: RichTextValues = {
    text: (initialValue?.text as string) || "",
    autoHeight: false,
    font: (initialValue?.font as IFontSelectInputValue) || {
      fontFamily: "Arial",
      source: "system-fonts",
    },
    color: { r: 255, g: 255, b: 255, a: 1 },
    fontSize: initialValue?.fontSize || "1em",
    ...getCommonPropertiesValues(),
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: RICH_TEXT,
      properties,
      values,
      valuesMetadata: { ...{}, ...getCommonPropertiesMetadataValues() },
    },
  };
}

export function getRichTextHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const textProperties = object.definition.values as RichTextValues;

  let style = "";
  style += "font-family: " + textProperties.font.fontFamily + ";";
  style += "font-size: " + textProperties.fontSize + ";";
  const c = textProperties.color;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  //style += "font-weight: " + textProperties.weight + ";";
  style += "width: " + calculatedObjectSize.width + ";";
  style += "height:" + calculatedObjectSize.height + ";";
  style += "position: absolute;";

  style += addCommonPropertiesToStyle(style, object);

  const css = `
    <style>
    .object-content-${object.id} p {
      margin: 0px;
    }
    </style>`;

  const ret = `${css}<div class="object-content object-content-${object.id}" style="${style}"> 
    ${textProperties.text} 
    </div>`;
  return ret;
}

export async function richTextSizeUpdate(props: {
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

export const richMeta = {
  name: "RICH TEXT",
  description: "Add rich text",
  preloadOrder: PreloadOrder.FIRST,
  icon: svg,
};
