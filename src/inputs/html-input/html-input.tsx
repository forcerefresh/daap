import { FormGroup, TextArea } from "@blueprintjs/core";
import { debounce, noop } from "lodash-es";
import React, { useCallback, useEffect, useState } from "react";
import { IHTMLInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";

export const HTMLInputForm: React.FC<IHTMLInput & IUpdateInput> = (props) => {
  const { displayName, value, onInput = noop, inputProps = {} } = props;
  const { rows = 5 } = inputProps;

  const throttledOnChange = useCallback(
    debounce((value: any) => onInput({ source: value }), 100),
    [onInput]
  );

  const [localValue, setLocalValue] = useState(value.source);

  useEffect(() => {
    if (localValue !== value.source) {
      setLocalValue(value.source);
    }
  }, [value.source]);

  const handleChange = (value: any) => {
    if (inputProps.disableDebounce) {
      onInput({ source: value });
    } else {
      throttledOnChange(value);
    }
  };

  return (
    <FormGroup label={displayName} labelFor="textarea-input">
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

