import { Classes, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React, { useMemo } from "react";
import { getUnderFieldText } from "../input-utils";
import { ITextInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";

export const TextInputForm: React.FC<ITextInput & IUpdateInput> = (props) => {
  const {
    displayName,
    helperText,
    value,
    onChange = noop,
    onInput = noop,
    inputProps = {},
    externalError = "",
  } = props;

  const inputId = useMemo(() => {
    return displayName + Math.random();
  }, []);

  const underFieldText = getUnderFieldText(helperText, externalError);

  return (
    <FormGroup
      label={displayName}
      labelFor={inputId}
      inline
      helperText={underFieldText}
    >
      <InputGroup
        id={inputId}
        value={value}
        intent={!!externalError ? Intent.WARNING : Intent.NONE}
        onChange={(event: any) => onChange(event.target.value)}
        onInput={(event: any) => onInput(event.target.value)}
        {...inputProps}
      />
    </FormGroup>
  );
};
