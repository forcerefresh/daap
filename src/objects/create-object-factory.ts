import { v4 as uuid } from "uuid";
import {
  ButtonPropertiesTuple,
  ButtonValues,
  CanvasProperties,
  CanvasPropertiesTuple,
  FrameProperties,
  ICoverPlacementValue,
  IFontSelectInputValue,
  IGridPlacementValue,
  ImageProperties,
  ImagePropertiesTuple,
  InputType,
  SourceImageProperties,
  SourceImagePropertiesTuple,
  SourceImageValues,
  SvgProperties,
  SvgPropertiesTuple,
  SvgValues,
  TextProperties,
  TextPropertiesTuple,
  TextValues,
  VideoProperties,
} from "../inputs/types";
import { FormType } from "../utils/form-layout/form-layout";
import {
  ICommonObjectProperties,
  IObject,
  ISlideTransition,
  ITransitions,
  ObjectType,
} from "./types";

/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export function createObject(
  type: ObjectType,
  objectProps: Partial<IObject>,
  initialValue?: {
    [key: string]: string;
  }
): Omit<IObject, "layerId"> {
  switch (type) {
    case ObjectType.TEXT: {
      return {
        ...createTextObject(initialValue, {
          hasOverflowProperty: true,
        }),
        ...objectProps,
      };
    }
    case ObjectType.IMAGE: {
      return {
        ...objectProps,
        ...createImageObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.VIDEO: {
      return {
        ...objectProps,
        ...createVideoObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.BUTTON: {
      return {
        ...objectProps,
        ...createButtonObject(initialValue),
      };
    }
    case ObjectType.SVG: {
      return {
        ...objectProps,
        ...createSvgObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.HTML: {
      return {
        ...objectProps,
        ...createSvgObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.CANVAS: {
      return {
        ...objectProps,
        ...createCanvasObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.SOURCE_IMAGE: {
      return {
        ...objectProps,
        ...createSourceImageObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
    case ObjectType.FRAME: {
      return {
        ...objectProps,
        ...createFrameObject(initialValue, {
          hasOverflowProperty: true,
        }),
      };
    }
  }
}

export function getDefaultSlideTransition(): ISlideTransition {
  return {
    duration: 2000,
    overlap: 1000,
    effect: {
      id: "none",
      values: {},
    },
  };
}

export function getDefaultTransitionsForObject(): ITransitions {
  return {
    in: {
      relativeTo: "stage",
      delay: 0,
      duration: 1000,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
    out: {
      relativeTo: "stage",
      delay: 0,
      duration: 1000,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
    effect: {
      relativeTo: "stage",
      delay: 0,
      duration: -1,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
  };
}

export function getDefaultTransitionsForLayer(): ITransitions {
  return {
    layer: {
      relativeTo: "stage",
      delay: 0,
      duration: 1000,
      ease: "none",
      timeDistribution: 50,
      effect: {
        id: "none",
        values: {},
      },
    },
  };
}

function createCommonObject(
  type: ObjectType
): Omit<IObject, keyof ICommonObjectProperties | "layerId" | "definition"> {
  return {
    id: uuid(),
    name: "", // will be over written
    type: type,
    isVisible: true,
    isLocked: false,
    transitions: getDefaultTransitionsForObject(),
    events: [],
    supportedLayout: {
      absolute: true,
      cover: true,
      grid: true,
    },
    layout: "absolute",
    absoluteLayout: {
      left: 100,
      top: 100,
      width: 300,
      height: 200,
    },
    gridLayout: {
      left: 1,
      right: 3,
      top: 1,
      bottom: 2,
    },
  };
}

function createTextObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<TextProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.TEXT);

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
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.TEXT,
      properties,
      values,
    },
  };
}

function createButtonObject(initialValue?: {
  [key: string]: any;
}): Omit<
  IObject<ButtonPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(ObjectType.BUTTON);

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
                  placeholderText: "",
                  allowedUnits: ["%", "px", "em"],
                },
                {
                  displayName: "Height",
                  propertyName: "sizeHeight",
                  inputType: InputType.UNITS_NUMBER,
                  value: "1em",
                  defaultValue: "1em",
                  placeholderText: "",
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
          placeholderText: "",
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
          placeholderText: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Distance Y",
          propertyName: "textShadowDistanceY",
          inputType: InputType.UNITS_NUMBER,
          value: "3px",
          defaultValue: "3px",
          placeholderText: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Blur",
          propertyName: "textShadowBlur",
          inputType: InputType.UNITS_NUMBER,
          value: "5px",
          defaultValue: "5px",
          placeholderText: "",
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
          placeholderText: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Distance Y",
          propertyName: "boxShadowDistanceY",
          inputType: InputType.UNITS_NUMBER,
          value: "3px",
          defaultValue: "3px",
          placeholderText: "",
          allowedUnits: ["%", "px", "em"],
        },
        {
          displayName: "Blur",
          propertyName: "boxShadowBlur",
          inputType: InputType.UNITS_NUMBER,
          value: "5px",
          defaultValue: "5px",
          placeholderText: "",
          allowedUnits: ["%", "px", "em"],
        },

        {
          displayName: "Spread",
          propertyName: "boxShadowSpread",
          inputType: InputType.UNITS_NUMBER,
          value: "0px",
          defaultValue: "0px",
          placeholderText: "",
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
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.BUTTON,
      properties,
      values,
    },
  };
}

function createImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<ImageProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.IMAGE);

  const properties: ImagePropertiesTuple = [
    {
      inputType: InputType.COVER_LAYOUT,
      displayName: "Fit",
      propertyName: "fit",
      value: {
        size: "fit",
        positionHorizontal: "center",
        positionVertical: "center",
      },
      defaultValue: {
        size: "fit",
        positionHorizontal: "center",
        positionVertical: "center",
      },
    },
    {
      displayName: "Image url",
      propertyName: "url",
      inputType: InputType.IMAGE,
      value: {
        url: initialValue?.url || "",
        width: 300,
        height: 300,
        isPlaceholder: !initialValue?.url,
      },
      defaultValue: {
        url: "",
        width: 300,
        height: 300,
        isPlaceholder: true,
      },
    },
  ];

  /*   ...(commonProperties?.hasOverflowProperty
      ? [
          {
            displayName: "Overflow",
            propertyName: "overflow",
            inputType: InputType.SELECT,
            value: "visible",
            defaultValue: "visible",
            options: [
              { value: "visible", label: "visible" },
              { value: "hidden", label: "hidden" },
            ],
          },
        ]
      : []), */

  const values = {
    fit: {
      size: "fit",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    url: {
      url: initialValue?.url || "",
      width: 300,
      height: 300,
      isPlaceholder: !initialValue?.url,
    },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.IMAGE,
      properties,
      values,
    },
  };
}

function createSourceImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<SourceImageProperties>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(ObjectType.SOURCE_IMAGE);

  const properties: SourceImagePropertiesTuple = [
    {
      displayName: "Identifier",
      propertyName: "id",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
    {
      displayName: "Visible",
      propertyName: "visible",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
    },
    {
      displayName: "Placement",
      propertyName: "placement",
      inputType: InputType.COVER_LAYOUT,
      value: initialValue?.placement || getDefaultCoveragePlacement(),
      defaultValue: getDefaultCoveragePlacement(),
    },
    {
      displayName: "Image url",
      propertyName: "url",
      inputType: InputType.IMAGE,
      value: {
        url: initialValue?.url || "",
        width: 300,
        height: 300,
        isPlaceholder: !initialValue?.url,
      },
      defaultValue: {
        url: "",
        width: 300,
        height: 300,
        isPlaceholder: true,
      },
    },
  ];

  const values: SourceImageValues = {
    id: "",
    visible: true,
    placement: initialValue?.placement || getDefaultCoveragePlacement(),
    url: {
      url: initialValue?.url || "",
      width: 300,
      height: 300,
      isPlaceholder: !initialValue?.url,
    },
  };

  return {
    ...object,
    isCoverPlacement: true,
    definition: {
      id: uuid(),
      type: ObjectType.SOURCE_IMAGE,
      properties,
      values,
    },
  };
}

function createVideoObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<VideoProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.VIDEO);

  const properties = [
    {
      displayName: "Video url",
      propertyName: "url",
      inputType: InputType.VIDEO,
      value: { url: "", width: 960, height: 540, isPlaceholder: true },
      defaultValue: {
        url: "",
        width: 960,
        height: 540,
        isPlaceholder: true,
      },
    },
  ];

  const values = {
    url: { url: "", width: 960, height: 540, isPlaceholder: true },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.VIDEO,
      properties,
      values,
    },
  };
}

function createSvgObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<SvgProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.SVG);

  const properties: SvgPropertiesTuple = [
    {
      displayName: "SVG code",
      propertyName: "svg",
      inputType: InputType.TEXTAREA,
      value: `<svg height="100" width="100">
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`,
      defaultValue: `<svg height="100" width="100">
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`,
    },
  ];

  const values: SvgValues = {
    svg: `<svg height="100" width="100">
    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
    </svg>`,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.SVG,
      properties,
      values,
    },
  };
}

function createCanvasObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<CanvasProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.CANVAS);

  const properties: CanvasPropertiesTuple = [
    {
      displayName: "Source",
      propertyName: "source",
      inputType: InputType.TEXT,
      value: "",
      defaultValue: "",
    },
  ];

  const values = {
    svg: "",
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.CANVAS,
      properties,
      values,
    },
  };
}

function createFrameObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<IObject<FrameProperties>, keyof ICommonObjectProperties | "layerId"> {
  const object = createCommonObject(ObjectType.FRAME);

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.FRAME,
      properties: [],
      values: {},
    },
  };
}

/* NOTE: consider moving to sibling file (...utils file) */

function getDefaultCoveragePlacement(): ICoverPlacementValue {
  return {
    size: "cover",
    positionHorizontal: "center",
    positionVertical: "center",
  };
}
