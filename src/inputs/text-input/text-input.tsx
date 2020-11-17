import { FormGroup, InputGroup } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React from "react";
import { ITextInput, IUpdateInput } from "../types";

export const TextInputForm: React.FC<ITextInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange = noop, onInput = noop } = props;
  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <InputGroup
        id="text-input"
        placeholder="Placeholder text"
        value={value}
        onChange={(event: any) => onChange(event.target.value)}
        onInput={(event: any) => onInput(event.target.value)}
      />
    </FormGroup>
  );
};
