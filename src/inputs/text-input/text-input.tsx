import { FormGroup, InputGroup } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React, { useMemo } from "react";
import { ITextInput, IUpdateInput } from "../types";

export const TextInputForm: React.FC<ITextInput & IUpdateInput> = (props) => {
  const {
    displayName,
    helperText,
    value,
    onChange = noop,
    onInput = noop,
    inputProps = {},
  } = props;

  const inputId = useMemo(() => {
    return displayName + Math.random();
  }, []);

  return (
    <FormGroup
      label={displayName}
      labelFor={inputId}
      inline
      helperText={!!helperText && helperText}
    >
      <InputGroup
        disabled={inputProps.disabled}
        id={inputId}
        placeholder={inputProps.placeholderText}
        value={value}
        onChange={(event: any) => onChange(event.target.value)}
        onInput={(event: any) => onInput(event.target.value)}
      />
    </FormGroup>
  );
};
