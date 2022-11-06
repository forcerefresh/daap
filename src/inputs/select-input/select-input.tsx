import { FormGroup, HTMLSelect, Intent } from "@blueprintjs/core";
import React, { ChangeEvent } from "react";
import { getGlobals } from "../../globals";
import { getUnderFieldText } from "../input-utils";
import { ISelectInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";

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
    externalError = "",
  } = props;

  const underFieldText = getUnderFieldText(helperText, externalError);

  return (
    <FormGroup
      label={displayName}
      labelFor="text-input"
      inline
      helperText={underFieldText}
    >
      <HTMLSelect
        className={!!externalError ? "warning" : ""}
        id="text-input"
        options={options}
        value={value}
        onChange={(event: ChangeEvent) =>
          onChange((event.currentTarget as HTMLSelectElement).value)
        }
        {...inputProps}
      />
    </FormGroup>
  );
};
