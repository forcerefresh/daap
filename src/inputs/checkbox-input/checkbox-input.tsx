import { Checkbox, FormGroup, InputGroup } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React from "react";
import { ICheckboxInput, IUpdateInput } from "../types";

export const CheckboxInputForm: React.FC<ICheckboxInput & IUpdateInput> = (
  props
) => {
  const { displayName, value, onChange = noop, helperText } = props;
  return (
    <FormGroup
      label={displayName}
      labelFor="checkbox-input"
      inline
      helperText={!!helperText && helperText}
    >
      <Checkbox
        id="checkbox-input"
        checked={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.checked);
        }}
      />
    </FormGroup>
  );
};
