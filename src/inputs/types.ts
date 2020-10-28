import { RGBColor } from "react-color";

export enum InputType {
  NUMBER = "number",
  TEXT = "text",
  SELECT = "select",
  COLOR = "color",
}

export interface IUpdateInput {
  onChange: (config: RGBColor | string | number) => void;
}

//  number input
export interface INumberInput {
  inputType: InputType.NUMBER;
  displayName: string;
  propertyName: string;
  value: number;
  defaultValue: number;
}

//  text input
export interface ITextInput {
  inputType: InputType.TEXT;
  displayName: string;
  propertyName: string;
  value: string;
  defaultValue: string;
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
  propertyName: string;
  value: string;
  defaultValue: string | null;
  options: { value: string; label: string }[];
}

// Full form for text
export interface TextProperties {
  color: IColorInput;
  fontSize: INumberInput;
  weight: ISelectInput;
}
