import { RGBColor } from "react-color";
import { IGridLayout } from "../objects/types";
import { Breakpoints } from "../store/reducers/i-settings";
import { ISlideDuration } from "../store/reducers/i-slides";
import {
  IFormGroupItem,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "../utils/form-layout/i-form-layout";

export enum InputType {
  INFO = "info",
  NUMBER = "number",
  UNITS_NUMBER = "units_number",
  NUMERIC_TIMELINE = "numeric_timeline",
  TEXT = "text",
  TEXTAREA = "textarea",
  SVG_TEXTAREA = "svg_textarea",
  SVG_INPUT = "svg_input",
  SVG_CUSTOM_COLORS = "svg_custom_colors",
  RICH_TEXTAREA = "rich_textarea",
  SELECT = "select",
  COLOR = "color",
  TRANSFORM_ORIGIN = "transform_origin",
  SPLIT = "split",
  TRANSFORM = "transform",
  SIZE = "size",
  SNAP = "snap",
  IMAGE = "image",
  MULTI_IMAGE = "multi_image",
  VIDEO = "video",
  CHECKBOX = "checkbox",
  FONT_SELECT = "font_select",
  //EVENTS = "events",
  PARALLAX = "parallax",
  COVER_LAYOUT = "cover_placement",
  GRID_LAYOUT = "grid_layout",
  TEXT_START_POSITION = "text_start_position",
  CORNER_RADIUS = "corner-radius",
  BORDER_COLOR = "border_color",
  COLOR_ARRAY = "color_array",
  COLOR_ARRAY_PRESETS = "color_array_preset",
  TIMELINES = "timelines",
  RELATIVE_POSITION_INPUT = "relative_position_input",
  RELATIVE_ROTATION_INPUT = "relative_rotation_input",
  SLIDER_INPUT = "slider_input",
  BUTTON_GROUP_INPUT = "button_group_input",
  BOX = "box",
  LAYOUT_CHILDREN = "layout_children",
  SLIDE_DURATION = "slide_duration",
}

export enum PresetGroup {
  color = "color",
  colors = "colors",
  effects = "effects",
}

export interface Preset<T> {
  name: string;
  value: T;
  created?: Date;
  modified?: Date;
}

// TODO: create interfaces for all input values
export interface IUpdateInput {
  onChange: (
    config:
      | RGBColor
      | { x: number; y: number }
      | IFontSelectInputValue
      | string
      | number
      | {
          center: { x: number; y: number };
          points: { x: number; y: number }[];
        }
      | {
          // parallax
          objects: { id: string; depth: number }[];
          smooth: boolean;
          autoDepth: boolean;
          autoDepthInc: number;
          strengthX: number;
          strengthY: number;
          setToInitialPositionOnComplete: boolean;
          followTime: number;
        }
      | ITimelinesValue
      | IRelativePositionValue
      | IRelativeRotationValue
      | ICoverPlacementValue
      | IGridPlacementValue
      | INumericTimelineValue
      | IBorderColorValue
      | ITextStartPositionValue
      | RGBColor[]
      | ICornerRadiusValue
      | IBoxValue
      | ILayoutChildrenValue
  ) => void;
  onInput?: (
    config: RGBColor | { x: number; y: number } | string | number
  ) => void;
}

//  number input
export interface INumberInput<T = string> {
  inputType: InputType.NUMBER;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: number;
  defaultValue: number;
  inputProps?: { disabled: boolean; className?: string };
  optional?: boolean;
}

type Units = "px" | "em" | "%";

//  advanced number input
export interface IUnitsNumberInput<T = string> {
  inputType: InputType.UNITS_NUMBER;
  displayName: string;
  helperText?: string;
  propertyName: T;
  allowedUnits: Units[];
  value: string;
  defaultValue: string;
  placeholder?: string;
  inputProps?: { disabled: boolean };
}
export interface IColorArrayInput<T = string> {
  inputType: InputType.COLOR_ARRAY;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: RGBColor[];
  defaultValue: RGBColor[];
}

export interface IBorderColorValue {
  useDifferentValues: boolean;
  borderColor: RGBColor;
  topBorderColor: RGBColor;
  bottomBorderColor: RGBColor;
  leftBorderColor: RGBColor;
  rightBorderColor: RGBColor;
}

export interface ISlideDurationInput<T = string> {
  inputType: InputType.SLIDE_DURATION;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ISlideDuration;
  defaultValue: ISlideDuration;
  commonDuration: number;
}

export interface IBorderColorInput<T = string> {
  inputType: InputType.BORDER_COLOR;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IBorderColorValue;
  defaultValue: IBorderColorValue;
}

export interface ITimelinePointValue {
  x: IRelativePositionValue;
  y: IRelativePositionValue;
  width: IRelativePositionValue;
  height: IRelativePositionValue;
  rotation: IRelativeRotationValue;
  opacity: IRelativePositionValue;
  zoom: IRelativePositionValue;
}

export interface ITimelinePoint {
  time: number;
  pointValue: ITimelinePointValue;
  easing: string;
}

export interface ITimelineValue {
  points: ITimelinePoint[];
}
export interface ITimelinesValue {
  timelines: ITimelineValue[];
}

export interface ITimelinesInput<T = string> {
  inputType: InputType.TIMELINES;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ITimelinesValue;
  defaultValue: ITimelinesValue;
}

export interface IRelativePositionValue {
  enabled: boolean;
  value: number;
  position: "rel" | "abs";
  easing: string;
}

export interface IRelativePositionInput<T = string> {
  inputType: InputType.RELATIVE_POSITION_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IRelativePositionValue;
  defaultValue: IRelativePositionValue;
}

export interface IRelativeRotationValue {
  enabled: boolean;
  value: number;
  position: "rel" | "abs";
  direction: "_cw" | "_ccw" | "_short";
}

export interface IRelativeRotationInput<T = string> {
  inputType: InputType.RELATIVE_ROTATION_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IRelativeRotationValue;
  defaultValue: IRelativeRotationValue;
}

// timeline numeric value (delay and duration)
export interface INumericTimelineValue {
  value: number | string;
  hasTimelineProperties: boolean;
  delay: number;
  duration: number;
}

export interface INumericTimelineInput<T = string> {
  inputType: InputType.NUMERIC_TIMELINE;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: INumericTimelineValue;
  defaultValue: INumericTimelineValue;
}

// timeline numeric value (delay and duration)
export interface ITextStartPositionValue {
  startFrom: string;
  fromCharacter?: number;
  customOrder?: string;
}

export interface ITextStartPositionInput<T = string> {
  inputType: InputType.TEXT_START_POSITION;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ITextStartPositionValue;
  defaultValue: ITextStartPositionValue;
}

//  text input
export interface ITextInput<T = string> {
  inputType: InputType.TEXT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: string;
  defaultValue: string;
  inputProps?: {
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    style: any;
  };
  externalError?: string | string[];
}
export interface IInfoInput<T = string> {
  inputType: InputType.INFO;
  displayName: string;
  helperText?: string;
}

export interface ICheckboxInput<T = string> {
  inputType: InputType.CHECKBOX;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: boolean;
  defaultValue: boolean;
  inputProps?: { disabled?: boolean };
}
export interface ITextAreaInput<T = string> {
  inputType: InputType.TEXTAREA;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: string;
  defaultValue: string;
  inputProps?: { disableDebounce?: boolean; rows?: number };
}

export interface ISVGValue {
  source: string;
  colorsType?: "unique" | "all";
  colors?: RGBColor[];
  disableCustomColors?: boolean;
}
export interface ISVGInput<T = string> {
  inputType: InputType.SVG_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ISVGValue;
  defaultValue: ISVGValue;
}

export interface ISVGTextAreaInput<T = string> {
  inputType: InputType.SVG_TEXTAREA;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ISVGValue;
  defaultValue: ISVGValue;
  inputProps?: { disableDebounce?: boolean; rows?: number };
  duplicate?: string;
}

export interface ISVGCustomColorsInput<T = string> {
  inputType: InputType.SVG_CUSTOM_COLORS;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ISVGValue;
  defaultValue: ISVGValue;
  duplicate?: string;
}

export interface IRichTextAreaInput<T = string> {
  inputType: InputType.RICH_TEXTAREA;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: string;
  defaultValue: string;
  inputProps?: { disableDebounce?: boolean; rows?: number };
}
export interface ITransformInput<T = string> {
  inputType: InputType.TEXT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: { left: number; top: number; width: number; height: number };
  defaultValue: { left: number; top: number; width: number; height: number };
  inputProps?: { selfSize?: boolean; disablePosition?: boolean };
}

export interface IEdgeInput<T = string> {
  inputType: InputType.TEXT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: {
    width: number;
    height: number;
    gap: number;
    edge: string;
    relativeTo: string;
  };
  defaultValue: {
    width: number;
    height: number;
    gap: number;
    edge: string;
    relativeTo: string;
  };
  inputProps?: { selfSize?: boolean; disablePosition?: boolean };
}

export interface ISizeInput<T = string> {
  inputType: InputType.SIZE;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: { width: number; height: number };
  defaultValue: { width: number; height: number };
  inputProps?: { disabled?: boolean };
}

export enum LayoutChildrenType {
  Column = "column",
  Row = "row",
  Table = "table",
  Inline = "inline",
}
export interface ILayoutChildrenValue {
  type: LayoutChildrenType;
  align: "start" | "center" | "end";
  justify: "start" | "center" | "end";
}

export interface ILayoutChildrenInput<T = string> {
  inputType: InputType.LAYOUT_CHILDREN;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ILayoutChildrenValue;
  defaultValue: ILayoutChildrenValue;
  inputProps?: {};
}

export interface IImageInputValue {
  url: string;
  width: number;
  height: number;
  isPlaceholder?: boolean;
}

export interface IImageInput<T = string> {
  inputType: InputType.IMAGE;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IImageInputValue;
  defaultValue: IImageInputValue;
}

export interface IMultiImageInput<T = string> {
  inputType: InputType.MULTI_IMAGE;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IImageInputValue[];
  defaultValue: IImageInputValue[];
}

export interface IVideoInputValue {
  url: string;
  width: number;
  height: number;
  isPlaceholder?: boolean;
}

export interface IVideoInput<T = string> {
  inputType: InputType.VIDEO;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IVideoInputValue;
  defaultValue: IVideoInputValue;
}

export interface ICoverPlacementValue {
  size: "cover" | "fit";
  positionHorizontal?: "left" | "center" | "right";
  positionVertical?: "top" | "center" | "bottom";
}

export interface ICoverPlacementInput<T = string> {
  inputType: InputType.COVER_LAYOUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ICoverPlacementValue;
  defaultValue: ICoverPlacementValue;
}

export interface IGridPlacementValue {
  type: "perDevice" | "common";
  common: IGridLayout;
  perDevice: IGridLayout[];
}

export interface IGridPlacementInput<T = string> {
  inputType: InputType.GRID_LAYOUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IGridPlacementValue;
  defaultValue: IGridPlacementValue;
  inputProps?: { disablePosition?: boolean };
  breakpoints?: Breakpoints;
  selectedDevice?: string;
  onChangeDevice?: (device: string) => void;
}

export interface IBoxValue {
  common?: string;
  t?: string;
  b?: string;
  l?: string;
  r?: string;
}

export interface IBoxInput<T = string> {
  inputType: InputType.BOX;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IBoxValue;
  defaultValue: IBoxValue;
}

export interface ICornerRadiusValue {
  common?: string;
  tl?: string;
  tr?: string;
  bl?: string;
  br?: string;
}

export interface ICornerRadiusInput<T = string> {
  inputType: InputType.CORNER_RADIUS;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ICornerRadiusValue;
  defaultValue: ICornerRadiusValue;
}

export interface ITransformOriginInput<T = string> {
  inputType: InputType.TRANSFORM_ORIGIN;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: { x: number; y: number };
  defaultValue: { x: number; y: number };
}

export interface ISplitInput<T = string> {
  inputType: InputType.SPLIT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: {
    center: { x: number; y: number };
    points: { x: number; y: number }[];
  };
  defaultValue: {
    center: { x: number; y: number };
    points: { x: number; y: number }[];
  };
}

export interface IParallaxInput<T = string> {
  inputType: InputType.PARALLAX;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: {
    objects: { id: string; depth: number }[];
    smooth: boolean;
    autoDepth: boolean;
    autoDepthInc: number;
    strengthX: number;
    strengthY: number;
    setToInitialPositionOnComplete: boolean;
    followTime: number;
  };
  defaultValue: {
    objects: { id: string; depth: number }[];
    smooth: boolean;
    autoDepth: boolean;
    autoDepthInc: number;
    strengthX: number;
    strengthY: number;
    setToInitialPositionOnComplete: boolean;
    followTime: number;
  };
}

export interface IInputMetadataValues {
  disabled?: boolean;
  exportForWizard?: boolean;
}

export interface IColorInput<T = string> {
  inputType: InputType.COLOR;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: RGBColor | null;
  defaultValue: RGBColor | null;
  optional?: boolean;
  metadata?: IInputMetadataValues;
}

export interface ISelectInput<T = string> {
  inputType: InputType.SELECT;
  displayName: string;
  helperText?: string | React.ReactNode;
  propertyName: T;
  value: string;
  defaultValue: string | null;
  options: { value: string; label: string }[];
  inputProps?: { disabled?: boolean; placeholder?: string };
  externalError?: string | string[];
}

/*export interface IEventsInput<T = string> {
  inputType: InputType.EVENTS;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: { events: IObjectEvent[] };
  defaultValue: { events: IObjectEvent[] };
}*/

export interface IFontSelectInputValue {
  fontFamily: string;
  source: "system-fonts" | "google-fonts" | string;
}
export interface IFontSelectInputOption {
  value: IFontSelectInputValue;
  label: string;
}
export interface IFontSelectInput<T = string> {
  inputType: InputType.FONT_SELECT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IFontSelectInputValue;
  defaultValue: IFontSelectInputValue;
}

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
  IUnitsNumberInput<"fontSize">
];

export interface CommonObjectValues {
  overflow?: boolean;
}
/*export interface ButtonProperties {
  fontFamily: IFontSelectInput;
  fontSize: INumberInput;
  borderSize: INumberInput;
  backgroundColor: IColorInput;
}*/

export interface BulletsValues extends CommonObjectValues {
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

export interface ISliderInput<T = string> {
  inputType: InputType.SLIDER_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: number;
  defaultValue: number;
  inputProps?: {
    min?: number;
    max?: number;
    sufix?: string;
    stepSize?: number;
    labelStepSize?: number;
    trackFill?: true;
    thumbPosition?: "top" | "bottom";
    hideLabels?: boolean;
  };
}

export interface IButtonGroupInput<T = string> {
  inputType: InputType.BUTTON_GROUP_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}

/*
export const ButtonLayout = [
  {
    groupName: "basic",
    optional: false,
    properties: [
      { property: "xyz", optional: true },
      {
        property: "dimensionsChoice",
        isTabs: true,
        tabsNames: ["Solid", "Gradient"],
        tabsProps: [
          [
            { property: "borderSize", optional: true },
            { property: "backgroundColor", optional: true },
          ],
          [
            { property: "borderSize-2", optional: true },
            { property: "backgroundColor-2", optional: true },
          ],
        ],
      },
    ],
  },
  {
    groupName: "shadow",
    optional: true,
    properties: [{ property: "boxShadow", optional: true }],
  },
];*/

export interface SourceImageValues {
  id: string;
  visible: boolean;
  placement: ICoverPlacementValue;
  url: IImageInputValue;
}

export type SourceImagePropertiesTuple = [
  ITextInput<"id">,
  ICheckboxInput<"visible">,
  ICoverPlacementInput<"placement">,
  IImageInput<"url">
];

export interface VideoValues {
  url: IVideoInputValue;
}

export type VideoPropertiesTuple = [IVideoInput<"url">];

export interface SvgValues {
  svg: ISVGValue;
  hasCustomColors: boolean;
  hasFillAndStroke: boolean;
  fill: RGBColor;
  stroke: RGBColor;
}

export type SvgPropertiesTuple = [
  ISVGInput<"svg">,
  IFormGroupItem<[IColorInput<"fill">, IColorInput<"stroke">]>,
  IFormGroupItem<[ISVGCustomColorsInput<"svg">]>
];

export type ArrowPropertiesTuple = [
  ISVGInput<"svg">,
  ICheckboxInput<"keepAspectRatio">,
  IFormGroupItem<[IColorInput<"fill">, IColorInput<"stroke">]>,
  IFormGroupItem<[IColorInput<"hoverFill">, IColorInput<"hoverStroke">]>,
  INumberInput<"hoverTransitionDuration">,
  IFormGroupItem<[ISVGCustomColorsInput<"svg">]>
];

export interface ArrowValues {
  svg: ISVGValue;
  hasCustomColors: boolean;
  keepAspectRatio: boolean;
  hasStrokeFill: boolean;
  fill: RGBColor;
  stroke: RGBColor;
  hasHover: boolean;
  hoverFill: RGBColor;
  hoverStroke: RGBColor;
  hoverTransitionDuration: number;
}

export interface HtmlProperties {
  html: ITextAreaInput;
}

export type HtmlPropertiesTuple = [ITextAreaInput<"html">];

export interface CanvasProperties {
  source: ITextInput;
}

export interface CanvasValues {
  source: string;
}

export type CanvasPropertiesTuple = [ITextInput<"source">];

export type FramePropertiesTuple = [];

export interface FrameProperties {}
