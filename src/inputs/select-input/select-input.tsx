import { FormGroup, HTMLSelect, Intent } from "@blueprintjs/core";
import React, { ChangeEvent } from "react";
import { getGlobals } from "../../globals";
import { getUnderFieldText } from "../input-utils";
import { ISelectInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { createInputLabel } from "../input-helpers";

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
    propertyName,
    customReadonlySelectedLabel,
  } = props;

  const underFieldText = getUnderFieldText(helperText, externalError);

  return (
    <FormGroup
      label={createInputLabel(displayName, propertyName)}
      labelFor="text-input"
      inline
      helperText={underFieldText}
    >
      <HTMLSelect
        className={!!externalError ? "warning" : ""}
        id="text-input"
        options={
          customReadonlySelectedLabel
            ? [
                {
                  label: customReadonlySelectedLabel,
                  value: customReadonlySelectedLabel,
                },
              ]
            : options
        }
        value={customReadonlySelectedLabel ?? value}
        onChange={(event: ChangeEvent) =>
          !customReadonlySelectedLabel &&
          onChange((event.currentTarget as HTMLSelectElement).value)
        }
        {...inputProps}
      />
    </FormGroup>
  );
};
