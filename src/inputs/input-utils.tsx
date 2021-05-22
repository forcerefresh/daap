import { noop } from "lodash-es";
import { getInputForm } from "./input-factory";
import { InputType } from "./types";

export function getNumericFiled<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabled?: boolean } = {}
) {
  const objectDef = {
    displayName: label,
    helperText: helperText,
    inputType: InputType.NUMBER,
    value: value,
    defaultValue: 0,
    inputProps,
  };

  const onInput = (value: any) => {
    onChange(value);
  };

  return getInputForm(InputType.NUMBER, objectDef, noop, onInput);
}

export function getSelectField<T>(
  label: string,
  value: T,
  options: { value: string | number; label: string }[],
  onChange: (value: T) => void,
  inputProps: { disabled?: boolean } = {}
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SELECT,
    value: value,
    options: options,
    inputProps,
  };

  return getInputForm(InputType.SELECT, objectDef, onChange);
}

export function getCheckboxField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabled?: boolean } = {}
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.CHECKBOX,
    value: value,
    helperText,
    inputProps,
  };

  return getInputForm(InputType.CHECKBOX, objectDef, onChange);
}
