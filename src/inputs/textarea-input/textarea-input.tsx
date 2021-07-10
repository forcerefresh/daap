import { FormGroup, InputGroup, Intent, TextArea } from "@blueprintjs/core";
import { debounce, noop, throttle } from "lodash-es";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ITextAreaInput, IUpdateInput } from "../types";

export const TextAreaInputForm: React.FC<ITextAreaInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onInput = noop, inputProps = {} } = props;

  const throttledOnChange = useCallback(
    debounce((value: any) => onInput(value), 500),
    [onInput]
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

  return (
    <FormGroup label={displayName} labelFor="textarea-input">
      <TextArea
        id="textarea-input"
        growVertically={true}
        rows={5}
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
