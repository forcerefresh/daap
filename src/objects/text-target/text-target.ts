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
  ITextInput,
  IUnitsNumberInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { nl2br } from "../../utils/doom-utils/common";
import {
  ICommonObjectProperties,
  IObject,
} from "../../webslider-sdk/src/objects/i-object";
import { v4 as uuid } from "uuid";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import svg from "./text-target.svg";
import {
  CommonPropertiesTuple,
  CommonPropertiesValues,
  getCommonObjectPropertiesDefinition,
  getCommonPropertiesMetadataValues,
  getCommonPropertiesValues,
} from "../../webslider-sdk/src/objects/common-properties";
import { addCommonPropertiesToStyle } from "../../utils/utils";
import { JSONSourceConnector } from "../json-loader/json-source-connector";

export const TEXT_TARGET = "text_target";

export interface TextTargetValues {
  sourceId: string;
  jsonPath: string;
  sampleText: string;
  autoHeight: boolean;
  font: IFontSelectInputValue;
  color: RGBColor;
  fontSize: string;
  weight: string;
  italic: boolean;
  underline: boolean;
  lineHeight: string;
  textAlign: string;
  preload: boolean;
}

export type TextTargetTuple = [
  ITextInput<"sourceId">,
  ITextInput<"jsonPath">,
  ITextAreaInput<"sampleText">,
  ICheckboxInput<"autoHeight">,
  IFontSelectInput<"font">,
  IColorInput<"color">,
  IUnitsNumberInput<"fontSize">,
  ISelectInput<"weight">,
  ICheckboxInput<"italic">,
  ICheckboxInput<"underline">,
  IUnitsNumberInput<"lineHeight">,
  ISelectInput<"textAlign">,
  ICheckboxInput<"preload">
];

export function createTextTarget(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<TextTargetTuple>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(TEXT_TARGET);

  const properties: TextTargetTuple = [
    {
      displayName: "Source ID",
      propertyName: "sourceId",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "JSON Path",
      propertyName: "jsonPath",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "Text",
      propertyName: "sampleText",
      inputType: InputType.TEXTAREA,
      value: (initialValue?.text as string) || "",
      defaultValue: "",
      helperText: "Sample text is used only during edit.", // TODO: fix this to work
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
      optional: true,
    },

    {
      displayName: "Text align",
      propertyName: "textAlign",
      inputType: InputType.SELECT,
      value: "left",
      defaultValue: "left",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Cente" },
        { value: "right", label: "Right" },
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

  const values: TextTargetValues = {
    sourceId: "",
    jsonPath: "",
    sampleText: "Sample text for edit mode only",
    autoHeight: false,
    font: (initialValue?.font as IFontSelectInputValue) || {
      fontFamily: "Arial",
      source: "system-fonts",
    },
    color: { r: 255, g: 255, b: 255, a: 1 },
    fontSize: initialValue?.fontSize || "1em",
    weight: "400",
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
      type: TEXT_TARGET,
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
  };
}

export function getTextTargetHtml(props: {
  object: IObject;
  calculatedObjectSize: React.CSSProperties;
  isPlayer?: boolean;
}) {
  const { object, calculatedObjectSize, isPlayer } = props;

  const textProperties = object.definition.values as TextTargetValues;
  const textPropertiesMeta = object.definition.valuesMetadata as {
    [key: string]: IInputMetadataValues;
  };

  let style = "";
  style += addCommonPropertiesToStyle(style, object);
  style += "font-family: " + textProperties.font.fontFamily + ";";
  style += "font-size: " + textProperties.fontSize + ";";
  const c = textProperties.color;
  style += `color: rgba(${c?.r},${c?.g},${c?.b},${c?.a});`;
  style += "font-weight: " + textProperties.weight + ";";
  style += "width: " + calculatedObjectSize.width + ";";
  style += "height:" + calculatedObjectSize.height + ";";
  style += "position: absolute;";

  if (!textPropertiesMeta.lineHeight?.disabled) {
    style += "line-height: " + textProperties.lineHeight + ";";
  }

  if (textProperties.italic) {
    style += "font-style: italic;";
  }
  if (textProperties.underline) {
    style += "text-decoration: underline;";
  }

  style += "text-align:" + textProperties.textAlign + ";";

  style += "margin: 0px;";

  return `<p class="object-content object-content-${
    object.id
  }" style="${style}">${isPlayer ? "" : nl2br(textProperties.sampleText)}</p>`;
}

export async function textTargetSizeUpdate(props: {
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

export async function textTargetStart(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
  getConnector?: (connectorId: string) => JSONSourceConnector;
}) {
  const { getConnector, values, id } = props;

  let text = "";
  if (getConnector) {
    const conn = getConnector(values.sourceId);
    text = await conn.getDataByPath(values.jsonPath);
  } else {
    console.warn(
      `Connector with source id '${values.sourceId}' is not available. Make sure that you have source object and make sure it is in front or same slide as target object.`
    );
  }

  const els = document.getElementsByClassName(`object-content-${id}`);
  const el = document.getElementsByClassName(`object-content-${id}`)[0];
  el.innerHTML = text;
  // TODO: check if animation can run after object exec
  Array.from(els).forEach((el) => {
    el.innerHTML = text;
  });
}

export async function preloadTextTarget(props: {
  id: string;
  className: string;
  values: { [key: string]: any };
  calculatedObjectSize: any;
}): Promise<string> {
  const { values } = props;
  const textValues = values as TextTargetValues;

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

export const textTargetMeta = {
  name: "TEXT TARGET",
  description: "Add text target",
  icon: svg,
};
