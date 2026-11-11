import { FormGroup } from "@blueprintjs/core";
import { isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useState } from "react";
import { getUnitNumericFiled } from "../input-utils";
import {
  ISizeInput,
  IUpdateInput,
  Units,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./size-unit-input.module.scss";

const ALLOWED_UNITS: Units[] = ["px", "%"];

export const SizeUnitInputForm: React.FC<ISizeInput & IUpdateInput> = (
  props
) => {
  const { value, onChange = noop, inputProps = {} } = props;

  const labelW = (props.inputProps as any).labelW;
  const labelH = (props.inputProps as any).labelH;

  const [internalValue, setInternalValue] = useState<{
    width: string;
    height: string;
  }>(pick(value, "width", "height") as any);

  const [latestValidValue, setLatestValidValue] = useState<{
    width: string;
    height: string;
  }>(pick(value, "width", "height") as any);

  useEffect(() => {
    if (!isEqual(value, latestValidValue)) {
      setLatestValidValue(pick(value, "width", "height") as any);
      setInternalValue(pick(value, "width", "height") as any);
    }
  }, [value]);

  const [valid, setValid] = useState<{
    width: boolean;
    height: boolean;
  }>({ width: true, height: true });

  const updateValue = (
    propertyName: "width" | "height",
    propertyValue: string
  ) => {
    internalValue[propertyName] = propertyValue;
    setInternalValue({ ...internalValue });

    const currValid = { ...valid };

    let propertyValueClean: string = propertyValue;

    ALLOWED_UNITS.forEach((unit: Units) => {
      propertyValueClean = propertyValueClean.replaceAll(unit as string, "");
    });

    const isWidthOrHeight =
      propertyValueClean === "width" || propertyValueClean === "height";
    const isNumber = new RegExp("^-?\\d*(\\.\\d+)?$").test(propertyValueClean);

    if (isWidthOrHeight) {
      currValid[propertyName] = true;
      const value2 = { ...value } as any;
      value2[propertyName] = propertyValue;
      setLatestValidValue({ ...value2 });
    } else if (isNumber && !isNaN(parseFloat(propertyValue))) {
      const isValidValue =
        propertyName === "width" || propertyName === "height"
          ? parseFloat(propertyValue) >= 0
          : true;

      currValid[propertyName] = isValidValue;

      if (isValidValue) {
        const value2 = { ...value } as any;
        value2[propertyName] = propertyValue;
        setLatestValidValue({ ...value2 });
      }
    } else {
      currValid[propertyName] = false;
    }

    setValid({ ...currValid });

    onChange({
      ...value,
      ...(currValid.width && { width: internalValue.width }),
      ...(currValid.height && { height: internalValue.height }),
    });
  };

  return (
    <div className={css.main}>
      <div>
        <FormGroup label={labelW ?? "W"} labelFor="text-input-W" inline>
          {getUnitNumericFiled(
            "",
            internalValue?.width?.toString(),
            (value: string) => updateValue("width", value),
            "",
            {
              disabled: inputProps.disabled,
              id: "text-input-W",
            } as any,
            [...ALLOWED_UNITS, "height"]
          )}
        </FormGroup>
        <FormGroup label={labelH ?? "H"} labelFor="text-input-H" inline>
          {getUnitNumericFiled(
            "",
            internalValue?.height?.toString(),
            (value: string) => updateValue("height", value),
            "",
            {
              disabled: inputProps.disabled,
              id: "text-input-H",
            } as any,
            [...ALLOWED_UNITS, "width"]
          )}
        </FormGroup>
      </div>
    </div>
  );
};
