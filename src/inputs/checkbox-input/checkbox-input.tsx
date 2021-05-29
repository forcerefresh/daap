import { Checkbox, FormGroup, InputGroup } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React from "react";
import { ICheckboxInput, IUpdateInput } from "../types";

export const CheckboxInputForm: React.FC<ICheckboxInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange = noop, helperText } = props;
  const labelFor = Math.random() + displayName;
  return (
    <FormGroup
      label={displayName}
      labelFor={labelFor}
      inline
      helperText={!!helperText && helperText}
    >
      <Checkbox
        id={labelFor}
        checked={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.checked);
        }}
      />
    </FormGroup>
  );
};
