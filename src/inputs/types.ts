import { RGBColor } from "react-color";
import {
  IFormGroupItem,
  IFormSwitchGroup,
  IFormSwitchGroupItem,
} from "../effects/trianglify/trianglify.definition";
import { IObjectEvent } from "../objects/types";

export enum InputType {
  NUMBER = "number",
  UNITS_NUMBER = "units_number",
  NUMERIC_TIMELINE = "numeric_timeline",
  TEXT = "text",
  TEXTAREA = "textarea",
  SELECT = "select",
  COLOR = "color",
  TRANSFORM_ORIGIN = "transform_origin",
  SPLIT = "split",
  TRANSFORM = "transform",
  IMAGE = "image",
  VIDEO = "video",
  CHECKBOX = "checkbox",
  FONT_SELECT = "font_select",
  EVENTS = "events",
  PARALLAX = "parallax",
  COVER_LAYOUT = "cover_placement",
  GRID_LAYOUT = "grid_layout",
  TEXT_START_POSITION = "text_start_position",
  CORNER_RADIUS = "corner-radius",
  BORDER_COLOR = "border_color",
  COLOR_ARRAY = "color_array",
  COLOR_ARRAY_PRESETS = "color_array_preset",
  CSS_TIMELINES = "css_timelines",
  RELATIVE_POSITION_INPUT = "relative_position_input",
  RELATIVE_ROTATION_INPUT = "relative_rotation_input",
  SLIDER_INPUT = "slider_input",
  BUTTON_GROUP_INPUT = "button_group_input",
  BOX = "box",
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
      | { events: IObjectEvent[] }
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
      | ICSSTimelinesValue
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
  inputProps?: { disabled: boolean };
  optional?: boolean;
}

type Units = "px" | "em" | "%";

//  advanced number input
export interface IUnitsNumberInput<T = string> {
  inputType: InputType.UNITS_NUMBER;
  placeholderText: string;
  displayName: string;
  helperText?: string;
  propertyName: T;
  allowedUnits: Units[];
  value: string;
  defaultValue: string;
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

export interface IBorderColorInput<T = string> {
  inputType: InputType.BORDER_COLOR;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IBorderColorValue;
  defaultValue: IBorderColorValue;
}

export interface ICSSPluginCSSValue {
  x: IRelativePositionValue;
  y: IRelativePositionValue;
  width: IRelativePositionValue;
  height: IRelativePositionValue;
  rotation: IRelativeRotationValue;
}

export interface ICSSPoint {
  time: number;
  css: ICSSPluginCSSValue;
  easing: string;
}

export interface ICSSTimelineValue {
  points: ICSSPoint[];
}
export interface ICSSTimelinesValue {
  timelines: ICSSTimelineValue[];
}

export interface ICSSTimelineInput<T = string> {
  inputType: InputType.CSS_TIMELINES;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: ICSSTimelinesValue;
  defaultValue: ICSSTimelinesValue;
}

export interface IRelativePositionValue {
  value: number;
  position: "rel" | "abs";
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
}
export interface ICheckboxInput<T = string> {
  inputType: InputType.CHECKBOX;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: boolean;
  defaultValue: boolean;
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
export interface ITransformInput<T = string> {
  inputType: InputType.TEXT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: { left: number; top: number; width: number; height: number };
  defaultValue: { left: number; top: number; width: number; height: number };
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

export interface IVideoInput<T = string> {
  inputType: InputType.VIDEO;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: {
    url: string;
    width: number;
    height: number;
    isPlaceholder?: boolean;
  };
  defaultValue: {
    url: string;
    width: number;
    height: number;
    isPlaceholder?: boolean;
  };
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
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IGridPlacementInput<T = string> {
  inputType: InputType.GRID_LAYOUT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: IGridPlacementValue;
  defaultValue: IGridPlacementValue;
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

export interface IColorInput<T = string> {
  inputType: InputType.COLOR;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: RGBColor | null;
  defaultValue: RGBColor | null;
}

export interface ISelectInput<T = string> {
  inputType: InputType.SELECT;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: string;
  defaultValue: string | null;
  options: { value: string; label: string }[];
}

export interface IEventsInput<T = string> {
  inputType: InputType.EVENTS;
  displayName: string;
  helperText?: string;
  propertyName: T;
  value: { events: IObjectEvent[] };
  defaultValue: { events: IObjectEvent[] };
}

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

// Full form for text
export interface TextProperties {
  text: ITextAreaInput;
  autoHeight: ICheckboxInput;
  font: IFontSelectInput;
  color: IColorInput;
  fontSize: IUnitsNumberInput;
  weight: ISelectInput;
}

export interface TextValues {
  text: string;
  autoHeight: boolean;
  font: IFontSelectInputValue;
  color: RGBColor;
  fontSize: string;
  weight: string;
}

export type TextPropertiesTuple = [
  ITextAreaInput<"text">,
  ICheckboxInput<"autoHeight">,
  IFontSelectInput<"font">,
  IColorInput<"color">,
  IUnitsNumberInput<"fontSize">,
  ISelectInput<"weight">
];

export interface ImageProperties {
  fit: ICoverPlacementInput;
  url: IImageInput;
}

export interface ImageValues {
  fit: ICoverPlacementValue;
  url: IImageInputValue;
}

export type ImagePropertiesTuple = [
  ICoverPlacementInput<"fit">,
  IImageInput<"url">
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
  backgroundType: "solid" | "gradient";
  backgroundColor: RGBColor;
  backgroundGradientColor1: RGBColor;
  backgroundGradientColor2: RGBColor;
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
  >
];

export interface ISliderInput {
  inputType: InputType.SLIDER_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface IButtonGroupInput {
  inputType: InputType.BUTTON_GROUP_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface SourceImageProperties {
  id: ITextInput;
  visible: ICheckboxInput;
  placement: ICoverPlacementInput;
  url: IImageInput;
}

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

export interface VideoProperties {
  url: IVideoInput;
}

export interface SvgProperties {
  svg: ITextAreaInput;
}

export interface SvgValues {
  svg: string;
}

export type SvgPropertiesTuple = [ITextAreaInput<"svg">];

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
