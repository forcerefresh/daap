import { Checkbox, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React, { useMemo, useState } from "react";
import { getUnderFieldText } from "../input-utils";
import { ITextInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";

export const PasswordInputForm: React.FC<ITextInput & IUpdateInput> = (
  props
) => {
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

  const [show, setShow] = useState(false);

  return (
    <FormGroup
      label={displayName}
      labelFor={inputId}
      inline
      helperText={underFieldText}
    >
      <InputGroup
        id={inputId}
        type={show ? "text" : "password"}
        value={value}
        intent={!!externalError ? Intent.WARNING : Intent.NONE}
        onChange={(event: any) => onChange(event.target.value)}
        onInput={(event: any) => onInput(event.target.value)}
        {...inputProps}
      />
      <Checkbox
        onChange={(e) => {
          setShow(e.currentTarget.checked);
        }}
      >
        Show key
      </Checkbox>
    </FormGroup>
  );
};
