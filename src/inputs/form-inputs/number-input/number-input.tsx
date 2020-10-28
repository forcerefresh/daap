import { FormGroup, InputGroup } from "@blueprintjs/core";
import React from "react";
import { INumberInput } from "../../types";

export const NumberInputForm: React.FC<INumberInput> = (props) => {
  const { displayName } = props;
  return (
    <FormGroup label={displayName} labelFor="text-input" inline>
      <InputGroup id="text-input" placeholder="Placeholder text" />
    </FormGroup>
  );
};
