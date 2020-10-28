import { FormGroup, InputGroup } from "@blueprintjs/core";
import React from "react";
import { ITextInput } from "../../types";

export const TextInputForm: React.FC<ITextInput> = (props) => {
  const { displayName } = props;
  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <InputGroup id="text-input" placeholder="Placeholder text" />
    </FormGroup>
  );
};
