import { RGBColor } from "react-color";
import {
  ICheckboxInput,
  IColorInput,
  IFontSelectInput,
  IFontSelectInputValue,
  InputType,
  ISelectInput,
  ISliderInput,
  ITextAreaInput,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import svg from "./text-icon.svg?raw";
import {
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "webslider-sdk/lib/objects/common-properties";
import { addCommonPropertiesToStyle } from "webslider-sdk/lib/objects/common-properties-player";
import {
  addTransformPropertiesToStyle,
} from "webslider-sdk/lib/objects/transform-properties";
import {
  GetFontsFuncPropsType,
  GetFontsFuncReturnType,
  GetHtmlFuncPropsType,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import {
  addCommonStyleToObjectElementContent,
  addTransformStyleToObjectElementContent,
  getObjectElementById,
  getObjectWrapperElementById,
} from "../../utils/animation-utils";
import { getObjectValuesForDevice } from "webslider-sdk/lib/objects/object-utils";

export const TEXT = "io.forcerefresh.text.object";

export enum TextType {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
  Body = "body",
  Caption = "caption",
  Tiny = "tiny",
}

export interface TextValues {
  text: string;
  type: TextType;
  autoHeight: boolean;
  initialAutoWidth?: boolean;
  font: IFontSelectInputValue;
  color: RGBColor;
  fontSize: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  lineHeight: number;
  textAlign: string;
  letterSpacing: string;
  fontKerning: boolean;
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
  ISliderInput<"lineHeight">,
  ISelectInput<"textAlign">,
  IUnitsNumberInput<"letterSpacing">,
  ICheckboxInput<"fontKerning">,
];

export function createTextObject(
  initialValue?: Record<string, any>,
): Omit<IObject, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(TEXT);

  const values: TextValues = {
    text: (initialValue?.text as string) || "",
    type: initialValue?.type || TextType.Body,
    autoHeight: initialValue?.autoHeight ?? true,
    initialAutoWidth: initialValue?.initialAutoWidth ?? false,
    font: (initialValue?.font as IFontSelectInputValue) || {
      fontFamily: "Arial",
      source: "system-fonts",
      weight: "400",
    },
    color: initialValue?.color ?? { r: 128, g: 128, b: 128, a: 1 },
    fontSize: initialValue?.fontSize || "1em",
    bold: false,
    italic: false,
    underline: false,
    lineHeight: initialValue?.lineHeight ?? 0,
    textAlign: initialValue?.textAlign ?? "left",
    letterSpacing: initialValue?.letterSpacing ?? "0px",
    fontKerning: true,
    preload: true,
  };

  object.properties = values;

  return object;
}

export function getTextObjectForm(): TextPropertiesTuple {
  const form: TextPropertiesTuple = [
    {
      displayName: "Text",
      propertyName: "text",
      inputType: InputType.TEXTAREA,
      value: "",
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
      value: {
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
      value: "1em",
      defaultValue: "1em",
    },
    {
      displayName: "Bold",
      propertyName: "bold",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
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
      inputType: InputType.SLIDER_INPUT,
      value: 0,
      defaultValue: 0,
      inputProps: {
        min: -50,
        max: 150,
        suffix: "%",
        stepSize: 1,
        labelStepSize: 1,
        thumbPosition: "top",
        hideLabels: false,
      },
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
    },
    {
      displayName: "Letter spacing",
      propertyName: "letterSpacing",
      inputType: InputType.UNITS_NUMBER,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "Font kerning",
      propertyName: "fontKerning",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
    },
  ];

  return form;
}

export function getTextHtml(props: GetHtmlFuncPropsType) {
  const { object, calculatedObjectSize, deviceType } = props;

  const textValues = getObjectValuesForDevice(
    object.properties as TextValues,
    deviceType,
  );

  const fontWeight = textValues.bold
    ? "700"
    : (textValues.font.weight ?? "400")
        .replace("italic", "")
        .replace("bold", "")
        .replace("regular", "400") + ";";

  let style = "";
  style = addCommonPropertiesToStyle(style, object, deviceType);
  style = addTransformPropertiesToStyle(style, object, deviceType);
  style += "font-family: '" + textValues.font.fontFamily + "';";
  style += "font-size: " + textValues.fontSize + ";";
  const c = textValues.color;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += `font-weight: ${fontWeight};`;
  style += "width: " + calculatedObjectSize.width + ";";
  style += "height:" + calculatedObjectSize.height + ";";
  style += "font-kerning:" + (textValues.fontKerning ? "auto" : "none") + ";";

  if ("lineHeight" in textValues) {
    style += "line-height: " + (1.25 + textValues.lineHeight / 100) + ";";
  }

  if ("letterSpacing" in textValues) {
    style += "letter-spacing: " + textValues.letterSpacing + ";";
  }

  if (textValues.italic) {
    style += "font-style: italic;";
  }
  if (textValues.underline) {
    style += "text-decoration: underline;";
  }

  style += "text-align:" + textValues.textAlign + ";";

  style += "margin: 0px;";
  style += "white-space: pre-wrap;";
  style += "overflow-wrap: break-word;";

  return `<p class="object-content object-content-${object.id}" style="${style}">${textValues.text}</p>`;
}

export async function textSizeUpdate(
  props: UpdateObjectSizeFuncPropsType,
): Promise<void> {
  const {
    id,
    calculatedObjectSize,
    properties,
    skipSizeUpdate,
    deviceType,
    style,
    transform,
  } = props;
  const textValues = getObjectValuesForDevice(
    properties as unknown as TextValues,
    deviceType,
  );

  const objectWrapperEl = getObjectWrapperElementById(id);
  const objectEl = getObjectElementById(id);
  const objectContentEl = objectEl.getElementsByClassName(
    "object-content",
  )[0] as HTMLElement;

  if (objectContentEl.innerHTML !== textValues.text) {
    objectContentEl.innerHTML = textValues.text;
  }

  if ("fontSize" in textValues)
    objectContentEl.style.fontSize = textValues.fontSize;
  if ("textAlign" in textValues)
    objectContentEl.style.textAlign = textValues.textAlign;
  if ("lineHeight" in textValues)
    objectContentEl.style.lineHeight = textValues.lineHeight + "px";
  if ("letterSpacing" in textValues)
    objectContentEl.style.letterSpacing = textValues.letterSpacing;

  const child = objectEl.firstChild! as HTMLDivElement;

  objectWrapperEl.style.left = calculatedObjectSize.left;
  objectWrapperEl.style.top = calculatedObjectSize.top;

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

  addCommonStyleToObjectElementContent(objectContentEl, style, deviceType);
  addTransformStyleToObjectElementContent(
    objectContentEl,
    transform,
    deviceType,
  );

  const transformProperties = getObjectValuesForDevice(transform);

  if (transformProperties?.transformOriginX) {
    objectWrapperEl.style.transformOrigin = `${
      transformProperties.transformOriginX ?? "left"
    }  ${transformProperties.transformOriginY ?? "top"}`;
  }
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

  const p = window.WSFontPreloader?.subscribe(
    textValues.font.fontFamily,
  );

  try {
    await p;
  } catch (ex) {}

  return textValues.font.fontFamily;
}

export const getFonts = (
  props: GetFontsFuncPropsType,
): GetFontsFuncReturnType => {
  const textValues = props.values as unknown as TextValues;

  const source = textValues.font?.source;

  if (source === "google-fonts" || source === "my-fonts") {
    return [{ ...textValues.font }];
  }
  return [];
};

export const textMeta = {
  name: "Text",
  description: "Add text object",
  icon: svg,
  isEditable: true,
  supportWidthResize: true,
};
