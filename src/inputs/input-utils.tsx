import { noop } from "lodash-es";
import { getInputForm } from "./input-factory";
import { InputType } from "./types";

export function getUnitNumericFiled<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabled?: boolean; style?: React.CSSProperties } = {}
) {
  const objectDef = {
    displayName: label,
    helperText: helperText,
    inputType: InputType.UNITS_NUMBER,
    value: value,
    defaultValue: 0,
    inputProps,
  };

  return getInputForm(InputType.UNITS_NUMBER, objectDef, onChange);
}

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

export function getColorField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabled?: boolean; style?: React.CSSProperties } = {}
) {
  const objectDef = {
    displayName: label,
    helperText: helperText,
    inputType: InputType.COLOR,
    value: value,
    defaultValue: value,
    inputProps,
  };

  return getInputForm(InputType.COLOR, objectDef, onChange);
}

export function getColorArrayField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabled?: boolean; style?: React.CSSProperties } = {}
) {
  const objectDef = {
    displayName: label,
    helperText: helperText,
    inputType: InputType.COLOR_ARRAY,
    value: value,
    defaultValue: value,
    inputProps,
  };

  return getInputForm(InputType.COLOR_ARRAY, objectDef, onChange);
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

export function getSelectSlider<T>(
  label: string,
  value: T,
  inputProperties: {
    min: number;
    max: number;
    sufix: string;
    stepSize: number;
    labelStepSize: number;
    trackFill: boolean;
  },
  onChange: (value: T) => void,
  inputProps: { disabled?: boolean } = {}
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SLIDER_INPUT,
    value: value,
    inputProperties: inputProperties,
    inputProps,
  };

  return getInputForm(InputType.SLIDER_INPUT, objectDef, onChange);
}

export function getCheckboxField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabled?: boolean } & { [key: string]: any } = {}
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

export function getTextArea<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabledDebounce?: boolean } = {}
) {
  const objectDef = {
    displayName: label,
    helperText: helperText,
    inputType: InputType.TEXTAREA,
    value: value,
    defaultValue: "",
    inputProps,
  };

  return getInputForm(InputType.TEXTAREA, objectDef, onChange);
}

export function getTextField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: { disabled?: boolean } = {}
) {
  const objectDef = {
    displayName: label,
    helperText: helperText,
    inputType: InputType.TEXT,
    value: value,
    defaultValue: "",
    inputProps,
  };

  return getInputForm(InputType.TEXT, objectDef, onChange);
}

export function getCoverLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.COVER_LAYOUT,
    value: value,
  };

  return getInputForm(InputType.COVER_LAYOUT, objectDef, onChange);
}

export function getGridLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.GRID_LAYOUT,
    value: value,
  };

  return getInputForm(InputType.GRID_LAYOUT, objectDef, onChange);
}

export function getAbsoluteLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  inputProps: { selfSize: boolean }
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.TRANSFORM,
    value: value,
    inputProps,
  };

  return getInputForm(InputType.TRANSFORM, objectDef, onChange);
}

export function getSizeLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  inputProps?: { disabled?: boolean }
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SIZE,
    value: value,
    inputProps,
  };

  return getInputForm(InputType.SIZE, objectDef, onChange);
}

export function getEdgeLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  inputProps: { selfSize: boolean }
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.EDGE,
    value: value,
    inputProps,
  };

  return getInputForm(InputType.EDGE, objectDef, onChange);
}

export function getButtonGroupField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  options: { value: string; label: string }[],
  helperText = ""
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.BUTTON_GROUP_INPUT,
    value: value,
    options,
    helperText,
  };

  return getInputForm(InputType.BUTTON_GROUP_INPUT, objectDef, onChange);
}
