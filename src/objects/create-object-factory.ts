import { v4 as uuid } from "uuid";
import {
  ArrowPropertiesTuple,
  ArrowValues,
  BulletsPropertiesTuple,
  BulletsValues,
  ButtonPropertiesTuple,
  ButtonValues,
  CanvasProperties,
  CanvasPropertiesTuple,
  FrameProperties,
  ICoverPlacementValue,
  IFontSelectInputValue,
  IGridPlacementValue,
  IInputMetadataValues,
  ImageProperties,
  ImagePropertiesTuple,
  ImageValues,
  InputType,
  MultiImagePropertiesTuple,
  MultiImageValues,
  RichTextPropertiesTuple,
  RichTextValues,
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
    case ObjectType.RICH_TEXT: {
      return {
        ...createRichTextObject(initialValue, {
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
    case ObjectType.MULTI_IMAGE: {
      return {
        ...objectProps,
        ...createMultiImageObject(initialValue, {
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
    case ObjectType.ARROW: {
      return {
        ...objectProps,
        ...createArrowObject(initialValue),
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
    case ObjectType.BULLETS: {
      return {
        ...createBulletsObject(initialValue),
        ...objectProps,
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
    selfSize: false,
    supportedLayout: {
      absolute: true,
      cover: true,
      grid: true,
      edge: true,
    },
    layout: "absolute",
    absoluteLayout: {
      left: 100,
      top: 100,
      width: 200,
      height: 200,
    },
    gridLayout: {
      left: 1,
      right: 3,
      top: 1,
      bottom: 2,
    },
    edgeLayout: {
      width: 200,
      height: 200,
      gap: 0,
      edge: "left",
      relativeTo: "stage",
    },
  };
}

function createRichTextObject(
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
  const object = createCommonObject(ObjectType.RICH_TEXT);

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
      placeholderText: "Enter font size",
      allowedUnits: ["px", "em", "%"],
      propertyName: "fontSize",
      inputType: InputType.UNITS_NUMBER,
      value: initialValue?.fontSize || "1em",
      defaultValue: "1em",
    },
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
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.RICH_TEXT,
      properties,
      values,
      valuesMetadata: {},
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
      valuesMetadata: {},
    },
  };
}

function createBulletsObject(initialValue?: {
  [key: string]: any;
}): Omit<
  IObject<BulletsPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(ObjectType.BULLETS);
  object.selfSize = true;

  object.supportedLayout.cover = false;
  object.supportedLayout.grid = false;

  const properties: BulletsPropertiesTuple = [
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
                  allowedUnits: ["%", "em", "px"],
                  placeholderText: "",
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
                  placeholderText: "",
                  allowedUnits: ["%", "px", "em"],
                },
                {
                  displayName: "Height",
                  propertyName: "rectHeight",
                  inputType: InputType.UNITS_NUMBER,
                  value: "10px",
                  defaultValue: "10px",
                  placeholderText: "",
                  allowedUnits: ["%", "px", "em"],
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
          placeholderText: "",
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
          placeholderText: "",
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
      type: ObjectType.BULLETS,
      properties,
      values,
      valuesMetadata: {},
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
      type: ObjectType.BUTTON,
      properties,
      values,
      valuesMetadata: {},
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
): Omit<
  IObject<ImagePropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
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
      displayName: "Path",
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

    {
      displayName: "Use for thumbnail",
      propertyName: "useForThumbnail",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
    },
  ];

  const values: ImageValues = {
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
    useForThumbnail: false,
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.IMAGE,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

function createMultiImageObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<MultiImagePropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(ObjectType.MULTI_IMAGE);

  const properties: MultiImagePropertiesTuple = [
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
      displayName: "Paths",
      propertyName: "urls",
      inputType: InputType.MULTI_IMAGE,
      value: initialValue?.urls ? initialValue?.urls : [],
      defaultValue: [],
    },
  ];

  const values: MultiImageValues = {
    fit: {
      size: "fit",
      positionHorizontal: "center",
      positionVertical: "center",
    },
    urls: initialValue?.urls ? initialValue?.urls : [],
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.MULTI_IMAGE,
      properties,
      values,
      valuesMetadata: {},
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
      valuesMetadata: {},
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
      valuesMetadata: {},
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
      displayName: "SVG",
      propertyName: "svg",
      inputType: InputType.SVG_TEXTAREA,
      value: {
        source: `<svg height="100" width="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
      </svg>`,
      },
      defaultValue: {
        source: `<svg height="100" width="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
      </svg>`,
      },
    },

    {
      displayName: "Fill",
      propertyName: "fill",
      inputType: InputType.COLOR,
      value: { r: 255, g: 255, b: 255, a: 1 },
      defaultValue: { r: 255, g: 255, b: 255, a: 1 },
    },
    {
      displayName: "Stroke",
      propertyName: "stroke",
      inputType: InputType.COLOR,
      value: { r: 0, g: 0, b: 0, a: 1 },
      defaultValue: { r: 0, g: 0, b: 0, a: 1 },
    },
  ];

  const values: SvgValues = {
    svg: initialValue?.svg
      ? initialValue.svg
      : {
          source: `<svg height="100" width="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
      </svg>`,
        },
    fill: { r: 255, g: 255, b: 255, a: 1 },
    stroke: { r: 0, g: 0, b: 0, a: 0 },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.SVG,
      properties,
      values,
      valuesMetadata: {},
    },
  };
}

function createArrowObject(
  initialValue?: {
    [key: string]: any;
  },
  commonProperties?: {
    hasOverflowProperty: boolean;
  }
): Omit<
  IObject<ArrowPropertiesTuple>,
  keyof ICommonObjectProperties | "layerId"
> {
  const object = createCommonObject(ObjectType.ARROW);

  const properties: ArrowPropertiesTuple = [
    {
      displayName: "SVG",
      propertyName: "svg",
      inputType: InputType.SVG_INPUT,
      value: { source: "" },
      defaultValue: { source: "" },
    },
    {
      displayName: "Aspect ratio",
      propertyName: "keepAspectRatio",
      inputType: InputType.CHECKBOX,
      value: true,
      defaultValue: true,
    },
    {
      displayName: "Fill and Stroke",
      type: FormType.GROUP,
      propertyName: "hasStrokeFill",
      optional: true,
      elements: [
        {
          displayName: "Fill",
          propertyName: "fill",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
          optional: true,
        },
        {
          displayName: "Stroke",
          propertyName: "stroke",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
          optional: true,
        },
      ],
    },

    {
      displayName: "Hover",
      type: FormType.GROUP,
      propertyName: "hasHover",
      optional: true,
      elements: [
        {
          displayName: "Fill",
          propertyName: "hoverFill",
          inputType: InputType.COLOR,
          value: { r: 255, g: 255, b: 255, a: 1 },
          defaultValue: { r: 255, g: 255, b: 255, a: 1 },
          optional: true,
        },
        {
          displayName: "Stroke",
          propertyName: "hoverStroke",
          inputType: InputType.COLOR,
          value: { r: 0, g: 0, b: 0, a: 1 },
          defaultValue: { r: 0, g: 0, b: 0, a: 1 },
          optional: true,
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
      displayName: "Custom colors",
      type: FormType.GROUP,
      propertyName: "hasCustomColors",
      optional: true,
      elements: [
        {
          displayName: "",
          duplicate: "1",
          propertyName: "svg",
          inputType: InputType.SVG_CUSTOM_COLORS,
          value: { source: "" },
          defaultValue: { source: "" },
        },
      ],
    },
  ];

  const values: ArrowValues = {
    hasCustomColors: false,
    svg: initialValue?.svg
      ? initialValue.svg
      : {
          source: `<svg height="100" width="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
    </svg>`,
          colors: [],
          colorsType: "unique",
          disableCustomColors: false,
        },
    keepAspectRatio: true,
    hasHover: true,
    hasStrokeFill: true,
    fill: { r: 255, g: 255, b: 255, a: 1 },
    stroke: { r: 0, g: 0, b: 0, a: 0 },
    hoverFill: { r: 255, g: 255, b: 255, a: 1 },
    hoverStroke: { r: 0, g: 0, b: 0, a: 0 },
    hoverTransitionDuration: 500,
  };

  const valuesMetadata: { [key: string]: IInputMetadataValues } = {
    fill: { exportForWizard: false, disabled: false },
    stroke: { exportForWizard: false, disabled: false },
    hoverFill: { exportForWizard: false, disabled: false },
    hoverStroke: { exportForWizard: false, disabled: false },
  };

  return {
    ...object,
    definition: {
      id: uuid(),
      type: ObjectType.SVG,
      properties,
      values,
      valuesMetadata,
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
      valuesMetadata: {},
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
      valuesMetadata: {},
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
