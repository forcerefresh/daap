import { FormGroup, HTMLSelect } from "@blueprintjs/core";
import React, { ChangeEvent } from "react";
import { getGlobals } from "../../globals";
import { ISelectInput, IUpdateInput } from "../types";

export const SelectInputForm: React.FC<ISelectInput & IUpdateInput> = (
  props
) => {
  const {
    displayName,
    options,
    value,
    onChange,
    helperText,
    inputProps = {},
  } = props;

  return (
    <FormGroup
      label={displayName}
      labelFor="text-input"
      inline
      helperText={helperText}
    >
      <HTMLSelect
        disabled={inputProps.disabled}
        id="text-input"
        options={options}
        value={value}
        onChange={(event: ChangeEvent) =>
          onChange((event.currentTarget as HTMLSelectElement).value)
        }
      />
    </FormGroup>
  );
};
