import React from "react";
import { noop } from "lodash-es";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { getInputForm } from "./input-factory";
import { InputType, Units } from "webslider-sdk/lib/inputs/i-inputs";

export function getUnitNumericFiled<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: {
    disabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
    showIncDec?: boolean;
  } = {},
  allowedUnits?: Units[]
) {
  const objectDef = {
    displayName: label,
    helperText: helperText,
    inputType: InputType.UNITS_NUMBER,
    value: value,
    defaultValue: 0,
    inputProps,
    allowedUnits,
  };

  return getInputForm(InputType.UNITS_NUMBER, objectDef, onChange);
}

export function getNumericFiled<T>(
  label: string | undefined,
  value: T,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: {
    disabled?: boolean;
    className?: string;
    stepSize?: number;
    majorStepSize?: number;
  } = {}
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
  inputProps: {
    disabled?: boolean;
    placeholder?: string;
    customReadonlySelectedLabel?: string;
  } = {},
  helperText?: string,
  externalError?: string | string[]
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SELECT,
    value: value,
    options: options,
    inputProps,
    helperText,
    externalError,
    customReadonlySelectedLabel: inputProps.customReadonlySelectedLabel,
  };

  return getInputForm(InputType.SELECT, objectDef, onChange);
}

export function getSelectSlider<T>(
  label: string,
  value: T,
  inputProperties: {
    min: number;
    max: number;
    suffix: string;
    stepSize: number;
    labelStepSize: number;
    trackFill: boolean;
  },
  onChange: (value: T) => void,
  onPreview: (value: T) => void,
  inputProps: { disabled?: boolean } = {}
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SLIDER_INPUT,
    value: value,
    inputProperties: inputProperties,
    inputProps,
  };

  return getInputForm(
    InputType.SLIDER_INPUT,
    objectDef,
    onChange,
    undefined,
    undefined,
    onPreview
  );
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
  value: T | undefined,
  onChange: (value: T) => void,
  helperText?: string,
  inputProps: {
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    style?: React.CSSProperties;
    autoFocus?: boolean;
  } = {}
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

export function getInheritTimeField<T>(
  label: string,
  value: T,
  options: { label: string; value: "custom" | string }[],
  onChange: (value: T) => void,
  parentTime: string | null
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.INHERIT_TIME,
    value: value,
    options,
    parentTime,
  };

  return getInputForm(InputType.INHERIT_TIME, objectDef, onChange);
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
    inputProps: {
      minimal: true,
    },
  };

  return getInputForm(InputType.COVER_LAYOUT, objectDef, onChange);
}

export function getGridLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  inputProps?: { disablePosition?: boolean },
  breakpoints: Breakpoints = { breakpointsConfiguration: [] },
  selectedDevice: string = "",
  onChangeDevice: (device: string) => void = (device: string) => undefined
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.GRID_LAYOUT,
    value: value,
    inputProps,
  };

  return getInputForm(InputType.GRID_LAYOUT, objectDef, onChange, onChange, {
    breakpoints,
    selectedDevice,
    onChangeDevice,
  });
}

export function getAbsoluteLayoutField<T>(
  label: string,
  value: T | undefined,
  onChange: (value: T) => void,
  inputProps?: {
    selfSize?: boolean;
    disablePosition?: boolean;
    disableSize?: boolean;
  },
  breakpoints: Breakpoints = { breakpointsConfiguration: [] },
  selectedDevice: string = "",
  onChangeDevice: (device: string) => void = (device: string) => undefined,
  relativeToLayer?: boolean
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.ABSOLUTE_LAYOUT,
    value: value,
    inputProps,
  };

  return getInputForm(
    InputType.ABSOLUTE_LAYOUT,
    objectDef,
    onChange,
    onChange,
    {
      breakpoints,
      selectedDevice,
      onChangeDevice,
      relativeToLayer,
    }
  );
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

export function getSizeUnitLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  allowedUnits: Units[],
  inputProps?: { disabled?: boolean }
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SIZE,
    value: value,
    inputProps,
    allowedUnits,
  };

  return getInputForm(InputType.SIZE_UNIT, objectDef, onChange);
}

export function getSizePosLayoutField<T>(
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

  return getInputForm(InputType.SIZE_POS, objectDef, onChange);
}

export function getSnapLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  inputProps?: { selfSize?: boolean; disablePosition?: boolean },
  breakpoints: Breakpoints = { breakpointsConfiguration: [] },
  selectedDevice: string = "",
  onChangeDevice: (device: string) => void = (device: string) => undefined,
  relativeToLayer?: boolean
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.SNAP,
    value: value,
    inputProps,
  };

  return getInputForm(InputType.SNAP, objectDef, onChange, onChange, {
    breakpoints,
    selectedDevice,
    onChangeDevice,
    relativeToLayer,
  });
}

export function getFitLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  inputProps?: { selfSize?: boolean; disablePosition?: boolean },
  breakpoints: Breakpoints = { breakpointsConfiguration: [] },
  selectedDevice: string = "",
  onChangeDevice: (device: string) => void = (device: string) => undefined,
  relativeToLayer?: boolean
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.FIT,
    value: value,
    inputProps,
  };

  return getInputForm(InputType.FIT, objectDef, onChange, onChange, {
    breakpoints,
    selectedDevice,
    onChangeDevice,
    relativeToLayer,
  });
}

export function getInsetLayoutField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  inputProps?: { selfSize?: boolean; disablePosition?: boolean },
  breakpoints: Breakpoints = { breakpointsConfiguration: [] },
  selectedDevice: string = "",
  onChangeDevice: (device: string) => void = (device: string) => undefined,
  relativeToLayer?: boolean
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.INSET,
    value: value,
    inputProps,
  };

  return getInputForm(InputType.INSET, objectDef, onChange, onChange, {
    breakpoints,
    selectedDevice,
    onChangeDevice,
    relativeToLayer,
  });
}

export function getButtonGroupField<T>(
  label: string | React.ReactNode,
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

export function getImageField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.IMAGE,
    value: value,
  };

  return getInputForm(InputType.IMAGE, objectDef, onChange);
}

export function getUnderFieldText(
  helperText?: string | React.ReactNode,
  externalError?: string | string[]
) {
  let ret;
  if (!!helperText || !!externalError) {
    ret = (
      <>
        {helperText}
        {externalError && (
          <>
            {!!helperText && <br />}
            <span className="warning">Ooops: {externalError}</span>
          </>
        )}
      </>
    );
  }
  return ret;
}

export function getFontFamilyField<T>(
  label: string,
  value: T,
  onChange: (value: T) => void,
  options?: { minimal?: boolean }
) {
  const objectDef = {
    displayName: label,
    inputType: InputType.FONT_SELECT,
    value: value,
    minimal: options?.minimal,
  };

  return getInputForm(InputType.FONT_SELECT, objectDef, onChange);
}
