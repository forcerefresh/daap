import { FormGroup, HTMLSelect } from "@blueprintjs/core";
import React, { ChangeEvent } from "react";
import { ISelectInput, IUpdateInput } from "../types";

export const SelectInputForm: React.FC<ISelectInput & IUpdateInput> = (
  props
) => {
  const { displayName, options, value, onChange } = props;
  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <HTMLSelect
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
