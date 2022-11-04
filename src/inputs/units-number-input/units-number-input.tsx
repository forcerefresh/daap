import { FormGroup, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { isEqual } from "lodash-es";
import React, { useEffect, useState } from "react";
import {
  IUnitsNumberInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import css from "./units-number-input.module.scss";

export type UnitType = "px" | "em" | "%" | "ms" | "s" | "deg" | null;
interface UnitValue {
  value: string;
  unit: UnitType;
}

function value2UnitValue(
  inputValue: string,
  allowedUnits: UnitType[]
): UnitValue {
  const inputValueStr = inputValue.toString();
  let unit: UnitType = null;
  let value = "";

  if (allowedUnits.indexOf("px") !== -1 && inputValueStr.includes("px")) {
    unit = "px";
    value = inputValueStr.split("px").join("");
  } else if (
    allowedUnits.indexOf("em") !== -1 &&
    inputValueStr.includes("em")
  ) {
    unit = "em";
    value = inputValueStr.split("em").join("");
  } else if (allowedUnits.indexOf("%") !== -1 && inputValueStr.includes("%")) {
    unit = "%";
    value = inputValueStr.split("%").join("");
  } else if (
    allowedUnits.indexOf("ms") !== -1 &&
    inputValueStr.includes("ms")
  ) {
    unit = "ms";
    value = inputValueStr.split("ms").join("");
  } else if (
    allowedUnits.indexOf("deg") !== -1 &&
    inputValueStr.includes("deg")
  ) {
    unit = "deg";
    value = inputValueStr.split("deg").join("");
  } else if (allowedUnits.indexOf("s") !== -1 && inputValueStr.includes("s")) {
    unit = "s";
    value = inputValueStr.split("s").join("");
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
    allowedUnits = ["px", "em", "%"],
    helperText,
    inputProps,
    value,
    onChange,
  } = props;

  const id = `${propertyName}_units_input_number`;

  const latestUnit = React.useRef<UnitType>(allowedUnits[0]);
  if (value2UnitValue(value, allowedUnits).unit !== null) {
    latestUnit.current = value2UnitValue(value, allowedUnits).unit;
  }

  const [internalValue, setInternalValue] = useState<UnitValue>(
    value2UnitValue(value, allowedUnits)
  );
  const [latestValidValue, setLatestValidValue] = useState<UnitValue>(
    value2UnitValue(value, allowedUnits)
  );

  useEffect(() => {
    if (!isEqual(value2UnitValue(value, allowedUnits), latestValidValue)) {
      setLatestValidValue(value2UnitValue(value, allowedUnits));
      setInternalValue(value2UnitValue(value, allowedUnits));
    }
  }, [value]);

  const [valid, setValid] = useState<boolean>(true);

  const updateValue = (newValue: string) => {
    const newValueValue = value2UnitValue(newValue, allowedUnits).value;
    setInternalValue(value2UnitValue(newValue, allowedUnits));

    const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(newValueValue);

    let isValidValue: boolean;

    //validate is number
    if (isNumber && !isNaN(parseFloat(newValueValue))) {
      isValidValue = true;

      if (isValidValue) {
        setLatestValidValue(value2UnitValue(newValue, allowedUnits));
      }
    } else {
      isValidValue = false;
    }

    setValid(isValidValue);

    if (!value2UnitValue(newValue, allowedUnits).unit) {
      newValue += latestUnit.current;
    }

    onChange(isValidValue ? newValue : value);
  };

  return (
    <FormGroup
      className={css.main}
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
        rightElement={
          <Tag minimal={true}>{value2UnitValue(value, allowedUnits).unit}</Tag>
        }
        value={internalValue.value}
        onChange={(event: any) => updateValue(event.target.value)}
        onInput={(event: any) => updateValue(event.target.value)}
        placeholder={placeholder}
        {...inputProps}
      />
    </FormGroup>
  );
};
