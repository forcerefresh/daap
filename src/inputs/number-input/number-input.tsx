import { FormGroup, NumericInput } from "@blueprintjs/core";
import { noop } from "lodash-es";
import React from "react";
import { INumberInput, IUpdateInput } from "../types";

export const NumberInputForm: React.FC<INumberInput & IUpdateInput> = (
  props
) => {
  const {
    displayName,
    propertyName,
    helperText,
    value,
    onInput = noop,
  } = props;

  const id = `${propertyName}_input_number`;

  console.log(value);
  return (
    <FormGroup
      label={displayName}
      labelFor={id}
      helperText={!!helperText && helperText}
      inline
    >
      <NumericInput
        id={id}
        value={value}
        onValueChange={(value, valueAsString) => {
          console.log(valueAsString);
          onInput(parseFloat(valueAsString));
        }}
      />
    </FormGroup>
  );
};

/*

<InputGroup
        id="text-input"
        value={`${value}`}
        onChange={(event: React.FormEvent<HTMLInputElement>) =>
          onChange((event.target as any).value)
        }
        onInput={(event: React.FormEvent<HTMLInputElement>) =>
          onInput((event.target as any).value)
        }
      />
      */
