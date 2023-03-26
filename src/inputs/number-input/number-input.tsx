import { FormGroup, Intent, NumericInput } from "@blueprintjs/core";
import classnames from "classnames";
import { isEqual, noop } from "lodash-es";
import React, { useEffect, useState } from "react";
import { getCheckboxField } from "../input-utils";
import { INumberInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import css from "./number-input.module.scss";
import { createInputLabel } from "../input-helpers";

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
    optional,
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
      if ((inputProps as any).min !== undefined) {
        isValidValue = newValue >= (inputProps as any).min;
      } else {
        isValidValue = true;
      }

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

  return (
    <FormGroup
      className={classnames(css.main, props.inputProps?.className)}
      label={createInputLabel(displayName, propertyName)}
      labelFor={id}
      helperText={!!helperText && helperText}
      inline
    >
      <div className={css.row}>
        <NumericInput
          className={css.numberInput}
          buttonPosition={"none"}
          intent={!valid ? Intent.WARNING : Intent.NONE}
          id={id}
          value={internalValue}
          onValueChange={(value, valueAsString) => {
            updateValue(valueAsString);
          }}
          {...inputProps}
        />
      </div>
    </FormGroup>
  );
};
