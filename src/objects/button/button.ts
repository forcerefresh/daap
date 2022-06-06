import { RGBColor } from "react-color";
import { v4 as uuid } from "uuid";
import { addBorderBox, addPaddingBox } from "../../export/export-html";

import {
  CommonObjectValues,
  IBoxInput,
  IBoxValue,
  ICheckboxInput,
  IColorInput,
  ICornerRadiusInput,
  ICornerRadiusValue,
  IFontSelectInput,
  IFontSelectInputValue,
  InputType,
  INumberInput,
  ISelectInput,
  ITextAreaInput,
  IUnitsNumberInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { nl2br } from "../../utils/doom-utils/common";
import {
  FormType,
  IFormGroupItem,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "../../webslider-sdk/src/form/i-form-layout";
import { addBorderRadius } from "../../utils/utils";
import { createCommonObject } from "../../webslider-sdk/src/objects/create-common-object";
import { PreloadOrder } from "../../webslider-sdk/src/objects/objects-register";
import {
  ICommonObjectProperties,
  IObject,
  ObjectType,
} from "../../webslider-sdk/src/objects/i-object";

import buttonIcon from "./button-icon.svg";

export const BUTTON = "button";

export type ButtonPropertiesTuple = [
  IFormGroupItem<[ITextAreaInput<"text">]>,
  IFormGroupItem<
    [
      IFormSwitchGroupItem<
        "sizeType",
        [
          IFormSwitchGroup<[IBoxInput<"sizePadding">]>,
          IFormSwitchGroup<
            [IUnitsNumberInput<"sizeWidth">, IUnitsNumberInput<"sizeHeight">]
          >
        ]
      >
    ]
  >,
  IFormGroupItem<
    [
      IFontSelectInput<"font">,
      IUnitsNumberInput<"fontSize">,
      IColorInput<"fontColor">,
      ISelectInput<"fontWeight">
    ]
  >,
  IFormGroupItem<
    [
      ISelectInput<"borderStyle">,
      IBoxInput<"borderSize">,
      IColorInput<"borderColor">,
      ICornerRadiusInput<"borderRadius">
    ]
  >,
  IFormGroupItem<
    [
      IFormSwitchGroupItem<
        "backgroundType",
        [
          IFormSwitchGroup<[IColorInput<"backgroundColor">]>,
          IFormSwitchGroup<
            [
              IColorInput<"backgroundGradientColor1">,
              IColorInput<"backgroundGradientColor2">
            ]
          >
        ]
      >
    ]
  >,
  IFormGroupItem<
    [
      IUnitsNumberInput<"textShadowDistanceX">,
      IUnitsNumberInput<"textShadowDistanceY">,
      IUnitsNumberInput<"textShadowBlur">,
      IColorInput<"textShadowColor">
    ]
  >,
  IFormGroupItem<
    [
      IUnitsNumberInput<"boxShadowDistanceX">,
      IUnitsNumberInput<"boxShadowDistanceY">,
      IUnitsNumberInput<"boxShadowBlur">,
      IUnitsNumberInput<"boxShadowSpread">,
      IColorInput<"boxShadowColor">,
      ICheckboxInput<"boxShadowInset">
    ]
  >,
  IFormGroupItem<
    [
      ISelectInput<"hoverBorderStyle">,
      IBoxInput<"hoverBorderSize">,
      IColorInput<"hoverBorderColor">,
      ICornerRadiusInput<"hoverBorderRadius">
    ]
  >,
  IFormGroupItem<
    [
      IFormSwitchGroupItem<
        "hoverBackgroundType",
        [
          IFormSwitchGroup<[IColorInput<"hoverBackgroundColor">]>,
          IFormSwitchGroup<
            [
              IColorInput<"hoverBackgroundGradientColor1">,
              IColorInput<"hoverBackgroundGradientColor2">
            ]
          >
        ]
      >
    ]
  >,
  INumberInput<"hoverTransitionDuration">
];

export interface ButtonValues extends CommonObjectValues {
  //basic
  text: string;
  //size
  sizeType: "padding" | "size";
  sizePadding: IBoxValue;
  sizeWidth: string;
  sizeHeight: string;
  // font
  font: IFontSelectInputValue;
  fontSize: string;
  fontColor: RGBColor;
  fontWeight: string;
  //border
  hasBorder: boolean;
  borderSize: IBoxValue;
  borderStyle: string;
  borderColor: RGBColor;
  borderRadius: ICornerRadiusValue;
  //background
  hasBackground: boolean;
  backgroundType: "solid" | "gradient";
  backgroundColor: RGBColor;
  backgroundGradientColor1: RGBColor;
  backgroundGradientColor2: RGBColor;
  // text shadow
  hasTextShadow: boolean;
  textShadowDistanceX: string;
  textShadowDistanceY: string;
  textShadowBlur: string;
  textShadowColor: RGBColor;
  //box shadow
  hasBoxShadow: boolean;
  boxShadowDistanceX: string;
  boxShadowDistanceY: string;
  boxShadowBlur: string;
  boxShadowSpread: string;
  boxShadowColor: RGBColor;
  boxShadowInset: boolean;
  //hover border
  hasHoverBorder: boolean;
  hoverBorderSize: IBoxValue;
  hoverBorderStyle: string;
  hoverBorderColor: RGBColor;
  hoverBorderRadius: ICornerRadiusValue;
  //hover background
  hasHoverBackground: boolean;
  hoverBackgroundType: "solid" | "gradient";
  hoverBackgroundColor: RGBColor;
  hoverBackgroundGradientColor1: RGBColor;
  hoverBackgroundGradientColor2: RGBColor;
  // transition duration
  hoverTransitionDuration: number;
}

export function createButtonObject(initialValue?: {
  [key: string]: any;
}): Omit<
  IObject<ButtonPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(BUTTON);
  object.selfSize = true;

  const properties: ButtonPropertiesTuple = [
    {
      displayName: "Basic",
      type: FormType.GROUP,
      propertyName: "hasBasic",
      elements: [
        {
          displayName: "Text",
          propertyName: "text",
          inputType: InputType.TEXTAREA,
          value: "",
          defaultValue: "",
          inputProps: { rows: 2 },
        },
      ],
    },
    {
      displayName: "Size",
      type: FormType.GROUP,
      propertyName: "hasSize",
      elements: [
        {
          type: FormType.SWITCH_GROUP,
          displayName: "",
          propertyName: "sizeType",
          groups: [
            {
              groupName: "Padding",
              groupValue: "padding",
              elements: [
                {
                  displayName: "Padding",
                  propertyName: "sizePadding",
                  inputType: InputType.BOX,
                  value: { common: "10px" },
                  defaultValue: { common: "10px" },
                },
              ],
            },
            {
              groupName: "Size",
              groupValue: "size",
              elements: [
                {
                  displayName: "Width",
                  propertyName: "sizeWidth",
                  inputType: InputType.UNITS_NUMBER,
                  value: "1em",
                  defaultValue: "1em",
                  placeholder: "",
                  allowedUnits: ["%", "px", "em"],
                },
                {
                  displayName: "Height",
                  propertyName: "sizeHeight",
                  inputType: InputType.UNITS_NUMBER,
                  value: "1em",
                  defaultValue: "1em",
                  placeholder: "",
                  allowedUnits: ["%", "px", "em"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      displayName: "Font",
      type: FormType.GROUP,
      propertyName: "hasFont",
      elements: [
        {
          displayName: "Font family",
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
          displayName: "Font size",
          propertyName: "fontSize",
          inputType: InputType.UNITS_NUMBER,
          value: "1em",
          defaultValue: "1em",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Font color",
          propertyName: "fontColor",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
        },
        {
          displayName: "Font Weight",
          propertyName: "fontWeight",
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
      ],
    },

    {
      displayName: "Border",
      type: FormType.GROUP,
      propertyName: "hasBorder",
      optional: true,
      elements: [
        {
          displayName: "Border style",
          propertyName: "borderStyle",
          inputType: InputType.SELECT,
          value: "solid",
          defaultValue: "solid",
          options: [
            { label: "solid", value: "solid" },
            { label: "dotted", value: "dotted" },
            { label: "dashed", value: "dashed" },
            { label: "double", value: "double" },
            { label: "groove", value: "groove" },
            { label: "ridge", value: "ridge" },
            { label: "inset", value: "inset" },
            { label: "outset", value: "outset" },
            { label: "none", value: "none" },
            { label: "hidden", value: "hidden" },
          ],
        },
        {
          displayName: "Border size",
          propertyName: "borderSize",
          inputType: InputType.BOX,
          value: { common: "1px" },
          defaultValue: { common: "1px" },
        },
        {
          displayName: "Border color",
          propertyName: "borderColor",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          displayName: "Border radius",
          propertyName: "borderRadius",
          inputType: InputType.CORNER_RADIUS,
          value: { common: "5px" },
          defaultValue: { common: "5px" },
        },
      ],
    },
    {
      displayName: "Background",
      type: FormType.GROUP,
      propertyName: "hasBackground",
      optional: true,
      elements: [
        {
          type: FormType.SWITCH_GROUP,
          displayName: "",
          propertyName: "backgroundType",
          groups: [
            {
              groupName: "Solid",
              groupValue: "solid",
              elements: [
                {
                  displayName: "Background color",
                  propertyName: "backgroundColor",
                  inputType: InputType.COLOR,
                  value: { r: 255, g: 255, b: 255, a: 1 },
                  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
                },
              ],
            },
            {
              groupName: "Gradient",
              groupValue: "gradient",
              elements: [
                {
                  displayName: "Color 1",
                  propertyName: "backgroundGradientColor1",
                  inputType: InputType.COLOR,
                  value: { r: 255, g: 255, b: 255, a: 1 },
                  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
                },
                {
                  displayName: "Color 2",
                  propertyName: "backgroundGradientColor2",
                  inputType: InputType.COLOR,
                  value: { r: 255, g: 255, b: 255, a: 1 },
                  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      displayName: "Text shadow",
      type: FormType.GROUP,
      propertyName: "hasTextShadow",
      optional: true,
      elements: [
        {
          displayName: "Distance X",
          propertyName: "textShadowDistanceX",
          inputType: InputType.UNITS_NUMBER,
          value: "3px",
          defaultValue: "3px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Distance Y",
          propertyName: "textShadowDistanceY",
          inputType: InputType.UNITS_NUMBER,
          value: "3px",
          defaultValue: "3px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Blur",
          propertyName: "textShadowBlur",
          inputType: InputType.UNITS_NUMBER,
          value: "5px",
          defaultValue: "5px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Shadow color",
          propertyName: "textShadowColor",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    },
    {
      displayName: "Button shadow",
      type: FormType.GROUP,
      propertyName: "hasBoxShadow",
      optional: true,
      elements: [
        {
          displayName: "Distance X",
          propertyName: "boxShadowDistanceX",
          inputType: InputType.UNITS_NUMBER,
          value: "3px",
          defaultValue: "3px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Distance Y",
          propertyName: "boxShadowDistanceY",
          inputType: InputType.UNITS_NUMBER,
          value: "3px",
          defaultValue: "3px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Blur",
          propertyName: "boxShadowBlur",
          inputType: InputType.UNITS_NUMBER,
          value: "5px",
          defaultValue: "5px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },

        {
          displayName: "Spread",
          propertyName: "boxShadowSpread",
          inputType: InputType.UNITS_NUMBER,
          value: "0px",
          defaultValue: "0px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Shadow color",
          propertyName: "boxShadowColor",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          displayName: "Inset",
          propertyName: "boxShadowInset",
          inputType: InputType.CHECKBOX,
          value: false,
          defaultValue: false,
        },
      ],
    },

    {
      displayName: "Hover border",
      type: FormType.GROUP,
      propertyName: "hasHoverBorder",
      optional: true,
      elements: [
        {
          displayName: "Hover border style",
          propertyName: "hoverBorderStyle",
          inputType: InputType.SELECT,
          value: "solid",
          defaultValue: "solid",
          options: [
            { label: "solid", value: "solid" },
            { label: "dotted", value: "dotted" },
            { label: "dashed", value: "dashed" },
            { label: "double", value: "double" },
            { label: "groove", value: "groove" },
            { label: "ridge", value: "ridge" },
            { label: "inset", value: "inset" },
            { label: "outset", value: "outset" },
            { label: "none", value: "none" },
            { label: "hidden", value: "hidden" },
          ],
        },
        {
          displayName: "Border size",
          propertyName: "hoverBorderSize",
          inputType: InputType.BOX,
          value: { common: "1px" },
          defaultValue: { common: "1px" },
        },
        {
          displayName: "Border color",
          propertyName: "hoverBorderColor",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          displayName: "Border radius",
          propertyName: "hoverBorderRadius",
          inputType: InputType.CORNER_RADIUS,
          value: { common: "5px" },
          defaultValue: { common: "5px" },
        },
      ],
    },
    {
      displayName: "Hover background",
      type: FormType.GROUP,
      propertyName: "hasHoverBackground",
      optional: true,
      elements: [
        {
          type: FormType.SWITCH_GROUP,
          displayName: "",
          propertyName: "hoverBackgroundType",
          groups: [
            {
              groupName: "Solid",
              groupValue: "solid",
              elements: [
                {
                  displayName: "Background color",
                  propertyName: "hoverBackgroundColor",
                  inputType: InputType.COLOR,
                  value: { r: 255, g: 255, b: 255, a: 1 },
                  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
                },
              ],
            },
            {
              groupName: "Gradient",
              groupValue: "gradient",
              elements: [
                {
                  displayName: "Color 1",
                  propertyName: "hoverBackgroundGradientColor1",
                  inputType: InputType.COLOR,
                  value: { r: 255, g: 255, b: 255, a: 1 },
                  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
                },
                {
                  displayName: "Color 2",
                  propertyName: "hoverBackgroundGradientColor2",
                  inputType: InputType.COLOR,
                  value: { r: 255, g: 255, b: 255, a: 1 },
                  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
                },
              ],
            },
          ],
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
  ];

  const values: ButtonValues = {
    //basic
    text: "Button",
    //size
    sizeType: "padding",
    sizePadding: { t: "10px", l: "30px", r: "30px", b: "10px" },
    sizeWidth: "200px",
    sizeHeight: "50px",
    //font
    font: (initialValue?.font as IFontSelectInputValue) || {
      fontFamily: "Arial",
      source: "system-fonts",
    },
    fontSize: "1em",
    fontColor: { r: 255, g: 255, b: 255, a: 1 },
    fontWeight: "400",
    //border
    hasBorder: true,
    borderSize: { common: "1px" },
    borderStyle: "solid",
    borderColor: { r: 0, g: 0, b: 0, a: 1 },
    borderRadius: { common: "5px" },
    //background
    hasBackground: true,
    backgroundType: "solid",
    backgroundColor: { r: 99, g: 99, b: 99, a: 1 },
    backgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    backgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
    //text shadow
    hasTextShadow: false,
    textShadowDistanceX: "3px",
    textShadowDistanceY: "3px",
    textShadowBlur: "5px",
    textShadowColor: { r: 0, g: 0, b: 0, a: 1 },
    //box shadow
    hasBoxShadow: false,
    boxShadowDistanceX: "3px",
    boxShadowDistanceY: "3px",
    boxShadowBlur: "5px",
    boxShadowSpread: "0px",
    boxShadowColor: { r: 0, g: 0, b: 0, a: 1 },
    boxShadowInset: false,
    //hover border
    hasHoverBorder: false,
    hoverBorderSize: { common: "1px" },
    hoverBorderStyle: "solid",
    hoverBorderColor: { r: 0, g: 0, b: 0, a: 1 },
    hoverBorderRadius: { common: "5px" },
    //hover background
    hasHoverBackground: false,
    hoverBackgroundType: "solid",
    hoverBackgroundColor: { r: 99, g: 99, b: 99, a: 1 },
    hoverBackgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    hoverBackgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
    //hover transition
    hoverTransitionDuration: 100,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: BUTTON,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

export function getButtonHtml(
  object: IObject,
  calculatedObjectSize: React.CSSProperties
) {
  const buttonProperties = object.definition.values as ButtonValues;

  let style = "";

  // text properties
  style += "font-family: " + buttonProperties.font.fontFamily + ";";
  style += "font-size: " + buttonProperties.fontSize + ";";
  const fc = buttonProperties.fontColor;
  style += `color: rgba(${fc?.r},${fc?.g},${fc?.b},${fc?.a});`;
  style += "font-weight: " + buttonProperties.fontWeight + ";";
  //

  if (buttonProperties.hasBackground) {
    switch (buttonProperties.backgroundType) {
      case "solid": {
        const bgc = buttonProperties.backgroundColor;
        style += `background-color: rgba(${bgc?.r},${bgc?.g},${bgc?.b},${bgc?.a});`;
        break;
      }
      case "gradient": {
        const bgc1 = buttonProperties.backgroundGradientColor1;
        const bgc2 = buttonProperties.backgroundGradientColor2;
        style += `background-image: linear-gradient(rgba(${bgc1?.r},${bgc1?.g},${bgc1?.b},${bgc1?.a}), rgba(${bgc2?.r},${bgc2?.g},${bgc2?.b},${bgc2?.a}));`;
        break;
      }
    }
  } else {
    style += `background: none;`;
  }

  if (buttonProperties.hasBorder) {
    style = addBorderBox(style, buttonProperties.borderSize);

    style += `border-style: ${buttonProperties.borderStyle};`;
    const bc = buttonProperties.borderColor;
    style += `border-color: rgba(${bc?.r},${bc?.g},${bc?.b},${bc?.a});`;
    style = addBorderRadius(style, buttonProperties.borderRadius);
  } else {
    style += "border-style: none;";
  }

  switch (buttonProperties.sizeType) {
    case "padding": {
      style = addPaddingBox(style, buttonProperties.sizePadding);
      break;
    }
    case "size": {
      style += `width: ${buttonProperties.sizeWidth};`;
      style += `height: ${buttonProperties.sizeHeight};`;
      break;
    }
  }

  if (buttonProperties.hasTextShadow) {
    const tsc = buttonProperties.textShadowColor;
    style += `text-shadow: ${buttonProperties.textShadowDistanceX} ${buttonProperties.textShadowDistanceY} ${buttonProperties.textShadowBlur} rgba(${tsc?.r},${tsc?.g},${tsc?.b},${tsc?.a});`;
  }

  if (buttonProperties.hasBoxShadow) {
    const bsc = buttonProperties.boxShadowColor;
    const bsInset = buttonProperties.boxShadowInset ? " inset" : "";
    style += `box-shadow: ${buttonProperties.boxShadowDistanceX} ${buttonProperties.boxShadowDistanceY} ${buttonProperties.boxShadowBlur} ${buttonProperties.boxShadowSpread} rgba(${bsc?.r},${bsc?.g},${bsc?.b},${bsc?.a})${bsInset};`;
  }

  style += "position: absolute;";
  style += "white-space: nowrap;";
  style += `transition-duration: ${buttonProperties.hoverTransitionDuration}ms;`;

  // HOVER START >>>>
  let cssHoverStyle = "";

  if (buttonProperties.hasHoverBorder) {
    cssHoverStyle = addBorderBox(
      cssHoverStyle,
      buttonProperties.hoverBorderSize
    );

    cssHoverStyle += `border-style: ${buttonProperties.hoverBorderStyle};`;
    const bhc = buttonProperties.hoverBorderColor;
    cssHoverStyle += `border-color: rgba(${bhc?.r},${bhc?.g},${bhc?.b},${bhc?.a});`;
    cssHoverStyle = addBorderRadius(
      cssHoverStyle,
      buttonProperties.hoverBorderRadius
    );
  } else {
    //cssHoverStyle += "border-style: none;";
  }

  if (buttonProperties.hasHoverBackground) {
    switch (buttonProperties.hoverBackgroundType) {
      case "solid": {
        const hbgc = buttonProperties.hoverBackgroundColor;
        cssHoverStyle += `background-color: rgba(${hbgc?.r},${hbgc?.g},${hbgc?.b},${hbgc?.a});`;
        break;
      }
      case "gradient": {
        const hbgc1 = buttonProperties.hoverBackgroundGradientColor1;
        const hbgc2 = buttonProperties.hoverBackgroundGradientColor2;
        cssHoverStyle += `background-image: linear-gradient(rgba(${hbgc1?.r},${hbgc1?.g},${hbgc1?.b},${hbgc1?.a}), rgba(${hbgc2?.r},${hbgc2?.g},${hbgc2?.b},${hbgc2?.a}));`;
        break;
      }
    }
  } else {
    //cssHoverStyle += `background: none;`;
  }

  const css = `<style>
    .object-content-${object.id}:hover {
      ${cssHoverStyle.replaceAll(";", " !important;")}
    }
    </style>`;

  // HOVER END <<<
  return `${css}<button class="object-content object-content-${
    object.id
  }" style="${style}">${nl2br(buttonProperties.text)}</button>`;
}

export async function buttonSizeUpdate(props: {
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

export const buttonMeta = {
  name: "BUTTON",
  description: "Add button",
  preloadOrder: PreloadOrder.FIRST,
  icon: buttonIcon,
};
