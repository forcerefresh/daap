import { RGBColor } from "react-color";
import { IObjectEvent } from "../objects/types";

export enum InputType {
  NUMBER = "number",
  UNITS_NUMBER = "units_number",
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
}

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
          objects: { id: string; depth: number }[];
          smooth: boolean;
          autoDepth: boolean;
          autoDepthInc: number;
          strengthX: number;
          strengthY: number;
          setToInitialPositionOnComplete: boolean;
          followTime: number;
        }
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
