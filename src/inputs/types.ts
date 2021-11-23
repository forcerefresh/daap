import { RGBColor } from "react-color";
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
  CSS_POINTS = "css_points",
  RELATIVE_POSITION_INPUT = "relative_position_input",
  RELATIVE_ROTATION_INPUT = "relative_rotation_input",
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
      | ICSSPointsValue
      | IRelativePositionValue
      | IRelativeRotationValue
      | ICoverPlacementValue
      | IGridPlacementValue
      | INumericTimelineValue
      | IBorderColorValue
      | ITextStartPositionValue
      | RGBColor[]
      | ICornerRadiusValue
  ) => void;
  onInput?: (
    config: RGBColor | { x: number; y: number } | string | number
  ) => void;
}

//  number input
export interface INumberInput {
  inputType: InputType.NUMBER;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: number;
  defaultValue: number;
  inputProps?: { disabled: boolean };
}

type Units = "px" | "em" | "%";

//  advanced number input
export interface IUnitsNumberInput {
  inputType: InputType.UNITS_NUMBER;
  placeholderText: string;
  displayName: string;
  helperText?: string;
  propertyName: string;
  allowedUnits: Units[];
  value: string;
  defaultValue: string;
  inputProps?: { disabled: boolean };
}
export interface IColorArrayInput {
  inputType: InputType.COLOR_ARRAY;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface IBorderColorInput {
  inputType: InputType.BORDER_COLOR;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface ICSSPointsValue {
  points: { time: number; css: ICSSPluginCSSValue; easing: string }[];
}

export interface ICSSPointsInput {
  inputType: InputType.CSS_POINTS;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: ICSSPointsValue;
  defaultValue: ICSSPointsValue;
}

export interface IRelativePositionValue {
  value: number;
  position: "rel" | "abs";
}

export interface IRelativePositionInput {
  inputType: InputType.RELATIVE_POSITION_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: IRelativePositionValue;
  defaultValue: IRelativePositionValue;
}

export interface IRelativeRotationValue {
  value: number;
  position: "rel" | "abs";
  direction: "_cw" | "_ccw" | "_short";
}

export interface IRelativeRotationInput {
  inputType: InputType.RELATIVE_ROTATION_INPUT;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface INumericTimelineInput {
  inputType: InputType.NUMERIC_TIMELINE;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: INumericTimelineValue;
  defaultValue: INumericTimelineValue;
}

// timeline numeric value (delay and duration)
export interface ITextStartPositionValue {
  startFrom: string;
  fromCharacter?: number;
  customOrder?: string;
}

export interface ITextStartPositionInput {
  inputType: InputType.TEXT_START_POSITION;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: ITextStartPositionValue;
  defaultValue: ITextStartPositionValue;
}

//  text input
export interface ITextInput {
  inputType: InputType.TEXT;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: string;
  defaultValue: string;
}
export interface ICheckboxInput {
  inputType: InputType.CHECKBOX;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: boolean;
  defaultValue: boolean;
}
export interface ITextAreaInput {
  inputType: InputType.TEXTAREA;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: string;
  defaultValue: string;
  inputProps?: { disableDebounce?: boolean };
}
export interface ITransformInput {
  inputType: InputType.TEXT;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: { left: number; top: number; width: number; height: number };
  defaultValue: { left: number; top: number; width: number; height: number };
}

export interface IImageInput {
  inputType: InputType.IMAGE;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface IVideoInput {
  inputType: InputType.VIDEO;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface ICoverPlacementInput {
  inputType: InputType.COVER_LAYOUT;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: ICoverPlacementValue;
  defaultValue: ICoverPlacementValue;
}

export interface IGridPlacementValue {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IGridPlacementInput {
  inputType: InputType.GRID_LAYOUT;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: IGridPlacementValue;
  defaultValue: IGridPlacementValue;
}

export interface ICornerRadiusValue {
  common?: string;
  tl?: string;
  tr?: string;
  bl?: string;
  br?: string;
}

export interface ICornerRadiusInput {
  inputType: InputType.CORNER_RADIUS;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: ICornerRadiusValue;
  defaultValue: ICornerRadiusValue;
}

export interface ITransformOriginInput {
  inputType: InputType.TRANSFORM_ORIGIN;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: { x: number; y: number };
  defaultValue: { x: number; y: number };
}

export interface ISplitInput {
  inputType: InputType.SPLIT;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: {
    center: { x: number; y: number };
    points: { x: number; y: number }[];
  };
  defaultValue: {
    center: { x: number; y: number };
    points: { x: number; y: number }[];
  };
}

export interface IParallaxInput {
  inputType: InputType.PARALLAX;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface IColorInput {
  inputType: InputType.COLOR;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: RGBColor | null;
  defaultValue: RGBColor | null;
}

export interface ISelectInput {
  inputType: InputType.SELECT;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: string;
  defaultValue: string | null;
  options: { value: string; label: string }[];
}

export interface IEventsInput {
  inputType: InputType.EVENTS;
  displayName: string;
  helperText?: string;
  propertyName: string;
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
export interface IFontSelectInput {
  inputType: InputType.FONT_SELECT;
  displayName: string;
  helperText?: string;
  propertyName: string;
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

export interface ImageProperties {
  fit: ICoverPlacementInput;
  url: IImageInput;
}

export interface SourceImageProperties {
  id: ITextInput;
  visible: ICheckboxInput;
  placement: ICoverPlacementInput;
  url: IImageInput;
}

export interface VideoProperties {
  url: IVideoInput;
}

export interface SvgProperties {
  svg: ITextAreaInput;
}

export interface HtmlProperties {
  html: ITextAreaInput;
}

export interface CanvasProperties {
  source: ITextInput;
}

export interface FrameProperties {}
