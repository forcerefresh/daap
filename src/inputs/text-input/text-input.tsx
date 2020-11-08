import { FormGroup, InputGroup } from "@blueprintjs/core";
import React from "react";
import { ITextInput, IUpdateInput } from "../types";

export const TextInputForm: React.FC<ITextInput & IUpdateInput> = (props) => {
  const { displayName, onChange } = props;
  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <InputGroup
        id="text-input"
        placeholder="Placeholder text"
        onChange={(event: any) => onChange(event.target.value)}
      />
    </FormGroup>
  );
};
