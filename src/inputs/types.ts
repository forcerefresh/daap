import { RGBColor } from "react-color";

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
}

export interface IUpdateInput {
  onChange: (
    config: RGBColor | { x: number; y: number } | string | number
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
  value: { url: string };
  defaultValue: { url: string };
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

// Full form for text
export interface TextProperties {
  text: ITextAreaInput;
  autoHeight: ICheckboxInput;
  color: IColorInput;
  fontSize: ITextInput;
  weight: ISelectInput;
}

export interface ImageProperties {
  url: IImageInput;
}
