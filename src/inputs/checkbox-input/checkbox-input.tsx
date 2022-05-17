import {
  Checkbox,
  FormGroup,
  ICheckboxProps,
  InputGroup,
} from "@blueprintjs/core";
import { noop } from "lodash-es";
import React from "react";
import { ICheckboxInput, IUpdateInput } from "../types";

export const CheckboxInputForm: React.FC<
  ICheckboxInput & IUpdateInput & { inputProps: ICheckboxProps }
> = (props) => {
  //console.log(props);
  const { displayName, value, onChange = noop, helperText, inputProps } = props;
  const labelFor = Math.random() + displayName;
  return (
    <FormGroup
      label={!inputProps?.alignIndicator ? displayName : ""}
      labelFor={labelFor}
      inline
      helperText={!!helperText && helperText}
    >
      <Checkbox
        {...inputProps}
        label={inputProps?.alignIndicator ? displayName : undefined}
        id={labelFor}
        checked={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.checked);
        }}
      />
    </FormGroup>
  );
};
