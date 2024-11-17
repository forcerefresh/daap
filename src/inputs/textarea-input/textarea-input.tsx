import { FormGroup, TextArea } from "@blueprintjs/core";
import { debounce, noop } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ITextAreaInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { createInputLabel } from "../input-helpers";

export const TextAreaInputForm: React.FC<ITextAreaInput & IUpdateInput> = (
  props
) => {
  const {
    displayName,
    value,
    onInput = noop,
    inputProps = {},
    propertyName,
  } = props;
  const { rows = 5 } = inputProps;

  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;

  const throttledOnChange = useCallback(
    debounce((value: any) => onInputRef.current(value), 500),
    []
  );

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (localValue !== value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (value: any) => {
    if (inputProps.disableDebounce) {
      onInput(value);
    } else {
      throttledOnChange(value);
    }
  };

  const inputLabel = createInputLabel(displayName, propertyName);

  return (
    <FormGroup label={inputLabel} labelFor="textarea-input">
      <TextArea
        id="textarea-input"
        growVertically={true}
        rows={rows}
        fill
        value={localValue}
        onChange={(event: any) => {
          setLocalValue(event.target.value);
          handleChange(event.target.value);
        }}
        onInput={(event: any) => {
          setLocalValue(event.target.value);
          handleChange(event.target.value);
        }}
      />
    </FormGroup>
  );
};
