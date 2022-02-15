import { FormGroup, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { isEqual } from "lodash-es";
import React, { useEffect, useState } from "react";
import { IUnitsNumberInput, IUpdateInput } from "../types";

interface UnitValue {
  value: string;
  unit: "px" | "em" | "%" | null;
}

function value2UnitValue(inputValue: string): UnitValue {
  const inputValueStr = inputValue.toString();
  let unit: "px" | "em" | "%" | null = null;
  let value = "";

  if (inputValueStr.includes("px")) {
    unit = "px";
    value = inputValueStr.split("px").join("");
  } else if (inputValueStr.includes("em")) {
    unit = "em";
    value = inputValueStr.split("em").join("");
  } else if (inputValueStr.includes("%")) {
    unit = "%";
    value = inputValueStr.split("%").join("");
  } else {
    value = inputValueStr;
  }

  return { value, unit };
}

export const UnitsNumberInputForm: React.FC<
  IUnitsNumberInput & IUpdateInput
> = (props) => {
  const {
    displayName,
    propertyName,
    placeholder,
    allowedUnits,
    helperText,
    inputProps,
    value,
    onChange,
  } = props;

  const id = `${propertyName}_units_input_number`;

  console.log(inputProps);
  const latestUnit = React.useRef<"px" | "em" | "%" | null>("px");
  if (value2UnitValue(value).unit !== null) {
    latestUnit.current = value2UnitValue(value).unit;
  }

  const [internalValue, setInternalValue] = useState<UnitValue>(
    value2UnitValue(value)
  );
  const [latestValidValue, setLatestValidValue] = useState<UnitValue>(
    value2UnitValue(value)
  );

  useEffect(() => {
    if (!isEqual(value2UnitValue(value), latestValidValue)) {
      setLatestValidValue(value2UnitValue(value));
      setInternalValue(value2UnitValue(value));
    }
  }, [value]);

  const [valid, setValid] = useState<boolean>(true);

  const updateValue = (newValue: string) => {
    const newValueValue = value2UnitValue(newValue).value;
    setInternalValue(value2UnitValue(newValue));

    const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(newValueValue);

    let isValidValue: boolean;

    //validate is number
    if (isNumber && !isNaN(parseFloat(newValueValue))) {
      isValidValue = true;

      if (isValidValue) {
        setLatestValidValue(value2UnitValue(newValue));
      }
    } else {
      isValidValue = false;
    }

    setValid(isValidValue);

    if (!value2UnitValue(newValue).unit) {
      newValue += latestUnit.current;
    }

    onChange(isValidValue ? newValue : value);
  };

  return (
    <FormGroup
      label={displayName}
      labelFor={id}
      helperText={!!helperText && helperText}
      inline
    >
      <InputGroup
        inputRef={(el) => {
          if (el) el!.autocomplete = "off";
        }}
        intent={!valid ? Intent.WARNING : Intent.NONE}
        id={id}
        rightElement={<Tag minimal={true}>{value2UnitValue(value).unit}</Tag>}
        value={internalValue.value}
        onChange={(event: any) => updateValue(event.target.value)}
        onInput={(event: any) => updateValue(event.target.value)}
        placeholder={placeholder}
        {...inputProps}
      />
    </FormGroup>
  );
};
