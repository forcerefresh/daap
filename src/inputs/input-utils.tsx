import { noop } from "lodash-es";
import { getInputForm } from "./input-factory";
import { InputType } from "./types";

export function getNumericFiled<T>(
  label: string,
  value: T,
  onChange: (value: T) => void
) {
  const objectDef = {
    displayName: label,
    // propertyName: label,
    inputType: InputType.NUMBER,
    value: value,
    defaultValue: 0,
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
  onChange: (value: T) => void
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SELECT,
    value: value,
    options: options,
  };

  return getInputForm(InputType.SELECT, objectDef, onChange);
}
