import { RGBColor } from "react-color";
import { IObjectEvent } from "../objects/types";

export enum InputType {
  NUMBER = "number",
  TEXT = "text",
  TEXTAREA = "textarea",
  SELECT = "select",
  COLOR = "color",
  TRANSFORM_ORIGIN = "transform_origin",
  TRANSFORM = "transform",
  IMAGE = "image",
  CHECKBOX = "checkbox",
  FONT_SELECT = "font_select",
  EVENTS = "events",
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

export interface ITransformOriginInput {
  inputType: InputType.TRANSFORM_ORIGIN;
  displayName: string;
  helperText?: string;
  propertyName: string;
  value: { x: number; y: number };
  defaultValue: { x: number; y: number };
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
  fontSize: ITextInput;
  weight: ISelectInput;
}

export interface ImageProperties {
  url: IImageInput;
}
