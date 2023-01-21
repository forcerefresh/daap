import {
  CommonObjectValues,
  IBoxInput,
  IBoxValue,
  ICheckboxInput,
  IColorInput,
  ICornerRadiusInput,
  ICornerRadiusValue,
  IImageInputValue,
  IMultiImageInput,
  InputType,
  INumberInput,
  ISelectInput,
  IUnitsNumberInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createCommonObject } from "webslider-sdk/lib/objects/create-common-object";
import {
  ICommonObjectProperties,
  IObject,
} from "webslider-sdk/lib/objects/i-object";
import { v4 as uuid } from "uuid";
import {
  GetAssetsUrlFuncPropsType,
  GetAssetsUrlFuncReturnType,
  GetHtmlFuncPropsType,
  PreloadOrder,
  UpdateObjectSizeFuncPropsType,
} from "webslider-sdk/lib/objects/objects-register";
import bulletsIcon from "./bullets-icon.svg";
import { addBorderRadius } from "../../utils/utils";
import {
  FormType,
  IFormGroupItem,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "webslider-sdk/lib/form/i-form-layout";
import { RGBColor } from "react-color";
import { addBorderBox } from "../../export/export-html";
import { getMediaSrc } from "../../integration/utils/local-media";
import { getImageThumbnailHtml } from "./bullets.utils";

export const BULLETS = "bullets";

export interface BulletsValues extends CommonObjectValues {
  bulletsType: "bullets" | "thumbnails";
  bulletsNumber: number;
  thumbnails: IImageInputValue[];
  //basic
  type: "circle" | "rectangle";
  circleWidth: string;
  rectWidth: string;
  rectHeight: string;
  gap: string;
  useThumbnails: boolean;
  thumbnailSize: string;
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
  //active border
  hasActiveBorder: boolean;
  activeBorderSize: IBoxValue;
  activeBorderStyle: string;
  activeBorderColor: RGBColor;
  activeBorderRadius: ICornerRadiusValue;
  //active background
  hasActiveBackground: boolean;
  activeBackgroundType: "solid" | "gradient";
  activeBackgroundColor: RGBColor;
  activeBackgroundGradientColor1: RGBColor;
  activeBackgroundGradientColor2: RGBColor;
}

export type BulletsPropertiesTuple = [
  IFormSwitchGroupItem<
    "bulletsType",
    [
      IFormSwitchGroup<[INumberInput<"bulletsNumber">]>,
      IFormSwitchGroup<[IMultiImageInput<"thumbnails">]>
    ]
  >,
  IFormGroupItem<
    [
      IFormSwitchGroupItem<
        "type",
        [
          IFormSwitchGroup<[IUnitsNumberInput<"circleWidth">]>,
          IFormSwitchGroup<
            [IUnitsNumberInput<"rectWidth">, IUnitsNumberInput<"rectHeight">]
          >
        ]
      >,
      IUnitsNumberInput<"gap">,
      ICheckboxInput<"useThumbnails">,
      IUnitsNumberInput<"thumbnailSize">
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
  INumberInput<"hoverTransitionDuration">,
  IFormGroupItem<
    [
      ISelectInput<"activeBorderStyle">,
      IBoxInput<"activeBorderSize">,
      IColorInput<"activeBorderColor">,
      ICornerRadiusInput<"activeBorderRadius">
    ]
  >,
  IFormGroupItem<
    [
      IFormSwitchGroupItem<
        "activeBackgroundType",
        [
          IFormSwitchGroup<[IColorInput<"activeBackgroundColor">]>,
          IFormSwitchGroup<
            [
              IColorInput<"activeBackgroundGradientColor1">,
              IColorInput<"activeBackgroundGradientColor2">
            ]
          >
        ]
      >
    ]
  >
];

export function createBulletsObject(initialValue?: {
  [key: string]: any;
}): Omit<
  IObject<BulletsPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(BULLETS);
  object.selfSize = true;

  object.supportedLayout.fit = false;
  object.supportedLayout.grid = false;

  const properties: BulletsPropertiesTuple = [
    {
      type: FormType.SWITCH_GROUP,
      displayName: "",
      propertyName: "bulletsType",
      groups: [
        {
          groupName: "Bullets",
          groupValue: "bullets",
          elements: [
            {
              displayName: "Bullets",
              propertyName: "bulletsNumber",
              inputType: InputType.NUMBER,
              value: 3,
              defaultValue: 3,
            },
          ],
        },
        {
          groupName: "Thumbnails",
          groupValue: "thumbnails",
          elements: [
            {
              displayName: "Images",
              propertyName: "thumbnails",
              inputType: InputType.MULTI_IMAGE,
              value: initialValue?.images || [],
              defaultValue: [],
            },
          ],
        },
      ],
    },

    {
      displayName: "Basic",
      type: FormType.GROUP,
      propertyName: "hasBasic",
      elements: [
        {
          type: FormType.SWITCH_GROUP,
          displayName: "",
          propertyName: "type",
          groups: [
            {
              groupName: "Circle",
              groupValue: "circle",
              elements: [
                {
                  displayName: "Radius",
                  propertyName: "circleWidth",
                  inputType: InputType.UNITS_NUMBER,
                  value: "10px",
                  defaultValue: "10px",
                  allowedUnits: ["px"],
                  placeholder: "",
                },
              ],
            },
            {
              groupName: "Rect",
              groupValue: "rectangle",
              elements: [
                {
                  displayName: "Width",
                  propertyName: "rectWidth",
                  inputType: InputType.UNITS_NUMBER,
                  value: "10px",
                  defaultValue: "10px",
                  placeholder: "",
                  allowedUnits: ["px"],
                },
                {
                  displayName: "Height",
                  propertyName: "rectHeight",
                  inputType: InputType.UNITS_NUMBER,
                  value: "10px",
                  defaultValue: "10px",
                  placeholder: "",
                  allowedUnits: ["px"],
                },
              ],
            },
          ],
        },
        {
          displayName: "Gap",
          propertyName: "gap",
          inputType: InputType.UNITS_NUMBER,
          value: "10px",
          defaultValue: "10px",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Thumbnails",
          propertyName: "useThumbnails",
          inputType: InputType.CHECKBOX,
          value: false,
          defaultValue: false,
        },
        {
          displayName: "Thumbnail size",
          propertyName: "thumbnailSize",
          inputType: InputType.UNITS_NUMBER,
          value: "100%",
          defaultValue: "100%",
          placeholder: "",
          allowedUnits: ["%", "px", "em"],
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
          value: { common: "0px" },
          defaultValue: { common: "0px" },
          helperText: "Applicable to Rect type only",
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
    {
      displayName: "Active border",
      type: FormType.GROUP,
      propertyName: "hasActiveBorder",
      optional: true,
      elements: [
        {
          displayName: "Active border style",
          propertyName: "activeBorderStyle",
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
          propertyName: "activeBorderSize",
          inputType: InputType.BOX,
          value: { common: "1px" },
          defaultValue: { common: "1px" },
        },
        {
          displayName: "Border color",
          propertyName: "activeBorderColor",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          displayName: "Border radius",
          propertyName: "activeBorderRadius",
          inputType: InputType.CORNER_RADIUS,
          value: { common: "5px" },
          defaultValue: { common: "5px" },
        },
      ],
    },
    {
      displayName: "Active background",
      type: FormType.GROUP,
      propertyName: "hasActiveBackground",
      optional: true,
      elements: [
        {
          type: FormType.SWITCH_GROUP,
          displayName: "",
          propertyName: "activeBackgroundType",
          groups: [
            {
              groupName: "Solid",
              groupValue: "solid",
              elements: [
                {
                  displayName: "Background color",
                  propertyName: "activeBackgroundColor",
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
                  propertyName: "activeBackgroundGradientColor1",
                  inputType: InputType.COLOR,
                  value: { r: 255, g: 255, b: 255, a: 1 },
                  defaultValue: { r: 255, g: 255, b: 255, a: 1 },
                },
                {
                  displayName: "Color 2",
                  propertyName: "activeBackgroundGradientColor2",
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
  ];

  const values: BulletsValues = {
    bulletsType: "bullets",
    bulletsNumber: 3,
    thumbnails: [],
    //basic
    type: "circle",
    circleWidth: "15px",
    rectHeight: "15px",
    rectWidth: "15px",
    gap: "10px",
    useThumbnails: false,
    thumbnailSize: "200%",
    //border
    hasBorder: true,
    borderSize: { common: "3px" },
    borderStyle: "solid",
    borderColor: { r: 41, g: 41, b: 41, a: 1 },
    borderRadius: { common: "0px" },
    //background
    hasBackground: true,
    backgroundType: "solid",
    backgroundColor: { r: 140, g: 140, b: 140, a: 1 },
    backgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    backgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
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
    //active border
    hasActiveBorder: false,
    activeBorderSize: { common: "1px" },
    activeBorderStyle: "solid",
    activeBorderColor: { r: 0, g: 0, b: 0, a: 1 },
    activeBorderRadius: { common: "5px" },
    //hover background
    hasActiveBackground: false,
    activeBackgroundType: "solid",
    activeBackgroundColor: { r: 99, g: 99, b: 99, a: 1 },
    activeBackgroundGradientColor1: { r: 0, g: 255, b: 255, a: 1 },
    activeBackgroundGradientColor2: { r: 255, g: 255, b: 0, a: 1 },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: BULLETS,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

export function getBulletsHtml(props: GetHtmlFuncPropsType) {
  const { object, isSave /*calculateSize*/ } = props;
  const bulletsValues = object.definition.values as BulletsValues;

  const bulletsNumber =
    bulletsValues.bulletsType === "bullets"
      ? bulletsValues.bulletsNumber
      : bulletsValues.thumbnails.length;
  let style = "";

  // text properties
  if (bulletsValues.type === "circle") {
    const circleWidth = bulletsValues.circleWidth; //calculateSize(bulletsValues.circleWidth, "width");
    style += "width: " + circleWidth + ";";
    style += "height: " + circleWidth + ";";
  } else {
    style += "width: " + bulletsValues.rectWidth + ";";
    style += "height: " + bulletsValues.rectHeight + ";";
  }

  //

  if (bulletsValues.hasBackground) {
    switch (bulletsValues.backgroundType) {
      case "solid": {
        const bgc = bulletsValues.backgroundColor;
        style += `background-color: rgba(${bgc?.r},${bgc?.g},${bgc?.b},${bgc?.a});`;
        break;
      }
      case "gradient": {
        const bgc1 = bulletsValues.backgroundGradientColor1;
        const bgc2 = bulletsValues.backgroundGradientColor2;
        style += `background-image: linear-gradient(rgba(${bgc1?.r},${bgc1?.g},${bgc1?.b},${bgc1?.a}), rgba(${bgc2?.r},${bgc2?.g},${bgc2?.b},${bgc2?.a}));`;
        break;
      }
    }
  } else {
    style += `background: none;`;
  }

  if (bulletsValues.hasBorder) {
    style = addBorderBox(style, bulletsValues.borderSize);

    style += `border-style: ${bulletsValues.borderStyle};`;
    const bc = bulletsValues.borderColor;
    style += `border-color: rgba(${bc?.r},${bc?.g},${bc?.b},${bc?.a});`;
    style = addBorderRadius(style, bulletsValues.borderRadius);
  } else {
    style += "border-style: none;";
  }

  if (bulletsValues.type === "circle") {
    style += "border-radius: 50%;";
  }

  style += `transition-duration: ${bulletsValues.hoverTransitionDuration}ms;`;

  // HOVER START >>>>
  let cssHoverStyle = "";

  if (bulletsValues.hasHoverBorder) {
    cssHoverStyle = addBorderBox(cssHoverStyle, bulletsValues.hoverBorderSize);

    cssHoverStyle += `border-style: ${bulletsValues.hoverBorderStyle};`;
    const bhc = bulletsValues.hoverBorderColor;
    cssHoverStyle += `border-color: rgba(${bhc?.r},${bhc?.g},${bhc?.b},${bhc?.a});`;
    cssHoverStyle = addBorderRadius(
      cssHoverStyle,
      bulletsValues.hoverBorderRadius
    );
  } else {
    //cssHoverStyle += "border-style: none;";
  }

  if (bulletsValues.type === "circle") {
    cssHoverStyle += "border-radius: 50%;";
  }

  if (bulletsValues.hasHoverBackground) {
    switch (bulletsValues.hoverBackgroundType) {
      case "solid": {
        const hbgc = bulletsValues.hoverBackgroundColor;
        cssHoverStyle += `background-color: rgba(${hbgc?.r},${hbgc?.g},${hbgc?.b},${hbgc?.a});`;
        break;
      }
      case "gradient": {
        const hbgc1 = bulletsValues.hoverBackgroundGradientColor1;
        const hbgc2 = bulletsValues.hoverBackgroundGradientColor2;
        cssHoverStyle += `background-image: linear-gradient(rgba(${hbgc1?.r},${hbgc1?.g},${hbgc1?.b},${hbgc1?.a}), rgba(${hbgc2?.r},${hbgc2?.g},${hbgc2?.b},${hbgc2?.a}));`;
        break;
      }
    }
  } else {
    //cssHoverStyle += `background: none;`;
  }
  // HOVER END <<

  // ACTIVE START >>>>
  let cssActiveStyle = "";

  if (bulletsValues.hasActiveBorder) {
    cssActiveStyle = addBorderBox(
      cssActiveStyle,
      bulletsValues.activeBorderSize
    );

    cssActiveStyle += `border-style: ${bulletsValues.activeBorderStyle};`;
    const bhc = bulletsValues.activeBorderColor;
    cssActiveStyle += `border-color: rgba(${bhc?.r},${bhc?.g},${bhc?.b},${bhc?.a});`;
    cssActiveStyle = addBorderRadius(
      cssActiveStyle,
      bulletsValues.activeBorderRadius
    );
  } else {
    //cssActiveStyle += "border-style: none;";
  }

  if (bulletsValues.type === "circle") {
    cssActiveStyle += "border-radius: 50%;";
  }

  if (bulletsValues.hasActiveBackground) {
    switch (bulletsValues.activeBackgroundType) {
      case "solid": {
        const hbgc = bulletsValues.activeBackgroundColor;
        cssActiveStyle += `background-color: rgba(${hbgc?.r},${hbgc?.g},${hbgc?.b},${hbgc?.a});`;
        break;
      }
      case "gradient": {
        const hbgc1 = bulletsValues.activeBackgroundGradientColor1;
        const hbgc2 = bulletsValues.activeBackgroundGradientColor2;
        cssActiveStyle += `background-image: linear-gradient(rgba(${hbgc1?.r},${hbgc1?.g},${hbgc1?.b},${hbgc1?.a}), rgba(${hbgc2?.r},${hbgc2?.g},${hbgc2?.b},${hbgc2?.a}));`;
        break;
      }
    }
  } else {
    //cssHoverStyle += `background: none;`;
  }
  // ACTIVE END <<

  const css = `
    <style>
    .object-content-item-${object.id} {
      ${style}
      cursor: pointer;
      overflow: hidden;
    }
    .object-content-item-${object.id}:not(:first-child) {
      margin-left: ${bulletsValues.gap};
    }
  
    .object-content-item-${object.id} > div {
      background-size: ${bulletsValues.thumbnailSize};
    }
  
    .object-content-item-${object.id}:hover {
      ${cssHoverStyle.replaceAll(";", " !important;")}
    }
  
    .object-content-item-${object.id}.active {
      ${cssActiveStyle.replaceAll(";", " !important;")}
    }
  
    </style>`;

  let bulletsHtml = "";
  if (bulletsValues.bulletsType === "bullets") {
    for (let i = 0; i < bulletsNumber; i++) {
      bulletsHtml += `<div class="object-content-item-${object.id}"></div>`;
    }
  } else if (bulletsValues.bulletsType === "thumbnails") {
    for (let i = 0; i < bulletsNumber; i++) {
      const imageItem = getMediaSrc(
        "image",
        bulletsValues.thumbnails[i].image,
        {
          useId: isSave,
          filename: bulletsValues.thumbnails[i].filename,
        }
      );

      bulletsHtml += `<div class="object-content-item-${object.id}">
        ${getImageThumbnailHtml(imageItem.src)}
      </div>`;
    }
  }

  // HOVER END <<<
  return `${css}<div class="object-content object-content-${object.id} ws-bullets-navigation" style="position:absolute; display: flex;">${bulletsHtml}</div>
    `;
}

export async function bulletsSizeUpdate(
  props: UpdateObjectSizeFuncPropsType
): Promise<void> {
  const { id, calculatedObjectSize, className /*calculateSize, values*/ } =
    props;
  const els = document.getElementsByClassName(className);
  const div = els[0] as HTMLDivElement;
  const parent = div.parentNode! as HTMLDivElement;
  //parent.style.width = calculatedObjectSize.width;
  //parent.style.height = calculatedObjectSize.height;
  parent.style.left = calculatedObjectSize.left;
  parent.style.top = calculatedObjectSize.top;

  // (
  //   Array.from(
  //     div.getElementsByClassName(`object-content-item-${id}`)
  //   ) as HTMLDivElement[]
  // ).forEach((el, idx) => {
  //   el.style.width = calculateSize(values.circleWidth, "width") + "px";
  //   el.style.height = calculateSize(values.circleWidth, "width") + "px";
  //   if (idx !== 0) {
  //     el.style.marginLeft = calculateSize(values.gap, "width") + "px";
  //   }
  // });

  //div.style.width = calculatedObjectSize.width;
  //div.style.height = calculatedObjectSize.height;
}

export const getBulletsAssetsUrls = (
  props: GetAssetsUrlFuncPropsType
): GetAssetsUrlFuncReturnType => {
  const bulletsValues = props.values as BulletsValues;

  if (bulletsValues.bulletsType === "bullets") return [];

  const ret: GetAssetsUrlFuncReturnType = [];
  bulletsValues.thumbnails.forEach((image) => {
    if (image.image.sourceType) {
      ret.push({
        id: image.image.id,
        url: image.image.url,
        filename: image.filename,
        localFilename: image.image.filename,
        sourceType: image.image.sourceType,
        mediaType: "image",
      });
    }
  });

  return ret;
};

export const bulletsMeta = {
  name: "BULLETS",
  description: "Add bullets navigation",
  preloadOrder: PreloadOrder.FIRST,
  icon: bulletsIcon,
};
