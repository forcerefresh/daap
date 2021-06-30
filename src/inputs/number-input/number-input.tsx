import { FormGroup, Intent, NumericInput } from "@blueprintjs/core";
import { isEqual, noop } from "lodash-es";
import React, { useEffect, useState } from "react";
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
    inputProps = {},
  } = props;

  const id = `${propertyName}_input_number`;

  const [internalValue, setInternalValue] = useState<string>(value.toString());

  const [latestValidValue, setLatestValidValue] = useState<string>(
    value.toString()
  );

  useEffect(() => {
    if (!isEqual(value.toString(), latestValidValue)) {
      setLatestValidValue(value.toString());
      setInternalValue(value.toString());
    }
  }, [value]);

  const [valid, setValid] = useState<boolean>(true);

  const updateValue = (newValue: string) => {
    const _internalValue = newValue;
    setInternalValue(_internalValue);

    const currValid = valid;

    const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(newValue);

    let isValidValue: boolean;

    //validate is number
    if (isNumber && !isNaN(parseFloat(newValue))) {
      isValidValue = true;

      // validation for positive
      /*propertyName === "width" || propertyName === "height"
          ? parseFloat(propertyValue) >= 0
          : true;*/

      if (isValidValue) {
        setLatestValidValue(newValue);
      }
    } else {
      isValidValue = false;
    }

    setValid(isValidValue);

    onInput(isValidValue ? parseFloat(newValue) : value);
  };

  const helperText2 = !valid ? "Error max value bla bla" : helperText;
  return (
    <FormGroup
      label={displayName}
      labelFor={id}
      helperText={!!helperText && helperText}
      inline
    >
      <NumericInput
        buttonPosition={"none"}
        intent={!valid ? Intent.WARNING : Intent.NONE}
        id={id}
        value={internalValue}
        onValueChange={(value, valueAsString) => {
          updateValue(valueAsString);
        }}
        {...inputProps}
      />
      {helperText2 && (
        <div className="bp3-form-helper-text">Please enter a value</div>
      )}
    </FormGroup>
  );
};
