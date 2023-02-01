import { RGBColor } from "react-color";
import {
  ICheckboxInput,
  IColorInput,
  IFontSelectInput,
  IFontSelectInputValue,
  IInputMetadataValues,
  InputType,
  ISelectInput,
  ITextAreaInput,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { nl2br } from "../../utils/doom-utils/common";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import svg from "./text-icon.svg";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  addTransformPropertiesToStyle,
  getTransformObjectPropertiesDefinition,
  getTransformPropertiesValues,
} from "webslider-sdk/lib/objects/transform-properties";
import {
  GetHtmlFuncPropsType,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import {
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../animations/animation-utils";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";

export const TEXT = "text";

export interface TextValues {
  text: string;
  autoHeight: boolean;
  font: IFontSelectInputValue;
  color: RGBColor;
  fontSize: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  lineHeight: string;
  textAlign: string;
  preload: boolean;
}

export type TextPropertiesTuple = [
  ITextAreaInput<"text">,
  ICheckboxInput<"autoHeight">,
  IFontSelectInput<"font">,
  IColorInput<"color">,
  IUnitsNumberInput<"fontSize">,
  ICheckboxInput<"bold">,
  ICheckboxInput<"italic">,
  ICheckboxInput<"underline">,
  IUnitsNumberInput<"lineHeight">,
  ISelectInput<"textAlign">,
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
      // optional: true,
      extraOptions: { devices: true, exportForWizard: true },
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
      displayName: "Size",
      placeholder: "Enter font size",
      allowedUnits: ["px", "em", "%"],
      propertyName: "fontSize",
      inputType: InputType.UNITS_NUMBER,
      value: initialValue?.fontSize || "1em",
      defaultValue: "1em",
      extraOptions: { devices: true, exportForWizard: true },
    },
    {
      displayName: "Bold",
      propertyName: "bold",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
      helperText: "This overrides font weight config",
    },
    {
      displayName: "Italic",
      propertyName: "italic",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
    },
    {
      displayName: "Underline",
      propertyName: "underline",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
    },
    {
      displayName: "Line height",
      propertyName: "lineHeight",
      inputType: InputType.UNITS_NUMBER,
      value: "",
      defaultValue: "",
      extraOptions: { devices: true, exportForWizard: true, optional: true },
    },
    {
      displayName: "Text align",
      propertyName: "textAlign",
      inputType: InputType.SELECT,
      value: "left",
      defaultValue: "left",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ],
      extraOptions: { devices: true, exportForWizard: true, optional: true },
    },
    {
      displayName: "Preload fonts",
      propertyName: "preload",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
      //inputProps: { disabled: true },
    },
  ];

  const values: TextValues = {
    text: (initialValue?.text as string) || "",
    autoHeight: false,
    font: (initialValue?.font as IFontSelectInputValue) || {
      fontFamily: "Arial",
      source: "system-fonts",
      weight: "400",
    },
    color: { r: 255, g: 255, b: 255, a: 1 },
    fontSize: initialValue?.fontSize || "1em",
    bold: false,
    italic: false,
    underline: false,
    lineHeight: "20px",
    textAlign: "left",
    preload: true, // not visible,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: TEXT,
      properties,
      values,
      valuesMetadata: {
        ...{ lineHeight: { exportForWizard: false, disabled: true } },
      },
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
  };
}

export function getTextHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const textValues = getObjectValuesForDevice(
    object.definition.values as TextValues,
    deviceType
  );

  const textPropertiesMeta = object.definition.valuesMetadata as {
    [key: string]: IInputMetadataValues;
  };

  const fontWeight = textValues.bold
    ? "700"
    : (textValues.font.weight ?? "400")
        .replace("italic", "")
        .replace("bold", "")
        .replace("regular", "400") + ";";

  let style = "";
  style = addCommonPropertiesToStyle(style, object);
  style = addTransformPropertiesToStyle(style, object);
  style += "font-family: " + textValues.font.fontFamily + ";";
  style += "font-size: " + textValues.fontSize + ";";
  const c = textValues.color;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += `font-weight: ${fontWeight};`;
  style += "width: " + calculatedObjectSize.width + ";";
  style += "height:" + calculatedObjectSize.height + ";";

  //style += "position: absolute;";

  if (!textPropertiesMeta.lineHeight?.disabled) {
    style += "line-height: " + textValues.lineHeight + ";";
  }

  if (textValues.italic) {
    style += "font-style: italic;";
  }
  if (textValues.underline) {
    style += "text-decoration: underline;";
  }

  style += "text-align:" + textValues.textAlign + ";";

  style += "margin: 0px;";

  return `<p class="object-content" style="${style}">${nl2br(
    textValues.text
  )}</p>`;
}

export async function textSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    className,
    scale,
    values,
    skipSizeUpdate,
    deviceType,
  } = props;
  const textValues = getObjectValuesForDevice(values as TextValues, deviceType);

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  const objectContentEl = objectEl.getElementsByClassName("object-content")[0];

  //const textValue = getObjectValue(textValues, "text", deviceType);
  if (objectContentEl.innerHTML !== nl2br(textValues.text)) {
    objectContentEl.innerHTML = nl2br(textValues.text);
  }

  //const els = document.getElementsByClassName(className);

  //const div = els[0] as HTMLDivElement;
  //const parent = objectEl.parentNode! as HTMLDivElement;
  const child = objectEl.firstChild! as HTMLDivElement;

  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

  // if (textValues.applyObjectScale) {
  //   (
  //     div.getElementsByClassName("object-content")[0] as HTMLElement
  //   ).style.transform = "scale(" + scale?.wScale + ")";
  // } else {
  if (!skipSizeUpdate) {
    if (!textValues.autoHeight) {
      child.style.height = calculatedObjectSize.height;
      objectWrapperEl.style.height = calculatedObjectSize.height;
      objectEl.style.height = calculatedObjectSize.height;
    }
    child.style.width = calculatedObjectSize.width;
    objectWrapperEl.style.width = calculatedObjectSize.width;
    objectEl.style.width = calculatedObjectSize.width;
  }

  // if (textValues.autoHeight) {
  //   child.style.height = "auto";
  //   parent.style.height = "auto";
  //   div.style.height = "auto";
  // }
  //}
}

export async function preloadText(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { values } = props;
  const textValues = values as TextValues;

  if (textValues.font.source === "system-fonts") {
    return Promise.resolve(textValues.font.fontFamily);
  }

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
