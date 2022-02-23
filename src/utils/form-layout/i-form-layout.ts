import { InputType } from "../../inputs/types";

export interface IFormLayoutItem {
  type?: FormType;
  inputType: InputType;
  displayName: string;
  propertyName: string;
  elements?: IFormLayoutItem[];
  optional?: boolean;
  options?: { value: string | number; label: string }[];
  // tab groups
  groups?: {
    groupName: string;
    groupValue: string;
    propertyName: string;
    elements?: IFormLayoutItem[];
  }[];
  duplicate?: string;
}

export enum FormType {
  INPUT = "input",
  GROUP = "group",
  SWITCH_GROUP = "switchGroup",
}

export interface IFormSwitchGroup<T = {}> {
  groupName: string;
  groupValue: string;
  elements: T;
}

export interface IFormSwitchGroupItem<NAME = string, GROUPS = {}> {
  type: FormType.SWITCH_GROUP;
  displayName: string;
  propertyName: NAME;
  groups: GROUPS;
}

export interface IFormGroupItem<T = {}> {
  type: FormType.GROUP;
  displayName: string;
  propertyName: string;
  optional?: boolean;
  initiallyOpen?: boolean;
  elements: T;
}

interface IFormInputItem {
  type?: FormType.INPUT;
  inputType: InputType;
  displayName: string;
  helperText?: string;
  propertyName: string;
  inputProps?: {
    [key: string]: any;
  };
}

export type IFormItem = IFormGroupItem | IFormSwitchGroupItem | IFormInputItem;
