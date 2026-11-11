import { isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useState } from "react";
import { ISizePosInput, IUpdateInput } from "webslider-sdk/lib/inputs/i-inputs";
import { getUnitNumericFiled } from "../input-utils";
import css from "./p1-p2-input.module.scss";

export const P1P2InputForm: React.FC<ISizePosInput & IUpdateInput> = (
  props
) => {
  const { value, onChange = noop, inputProps = {} } = props;

  const [internalValue, setInternalValue] = useState<{
    x1: string;
    y1: string;
    x2: string;
    y2: string;
  }>(pick(value, "x1", "y1", "x2", "y2") as any);

  const [latestValidValue, setLatestValidValue] = useState<{
    x1: string;
    y1: string;
    x2: string;
    y2: string;
  }>(pick(value, "x1", "y1", "x2", "y2") as any);

  useEffect(() => {
    if (!isEqual(value, latestValidValue)) {
      setLatestValidValue(pick(value, "x1", "y1", "x2", "y2") as any);
      setInternalValue(pick(value, "x1", "y1", "x2", "y2") as any);
    }
  }, [value]);

  const updateValue = (
    propertyName: "x1" | "y1" | "x2" | "y2",
    propertyValue: string
  ) => {
    internalValue[propertyName] = propertyValue;
    setInternalValue({ ...internalValue });

    const value2 = { ...value } as any;
    value2[propertyName] = propertyValue;
    setLatestValidValue({ ...value2 });

    onChange({
      ...value,
      ...{ x1: internalValue.x1 },
      ...{ y1: internalValue.y1 },
      ...{ x2: internalValue.x2 },
      ...{ y2: internalValue.y2 },
    });
  };

  return (
    <div className={css.main}>
      <div>
        {getUnitNumericFiled(
          "X1",
          internalValue?.x1,
          (v: string) => {
            updateValue("x1", v);
          },
          "",
          {
            disabled: inputProps.disabled,
          },
          ["px"]
        )}
        {getUnitNumericFiled(
          "Y1",
          internalValue?.y1,
          (v: string) => {
            updateValue("y1", v);
          },
          "",
          {
            disabled: inputProps.disabled,
          },
          ["px"]
        )}
      </div>
      <div>
        {getUnitNumericFiled(
          "X2",
          internalValue?.x2,
          (v: string) => {
            updateValue("x2", v);
          },
          "",
          {
            disabled: inputProps.disabled,
          },
          ["px"]
        )}
        {getUnitNumericFiled(
          "Y2",
          internalValue?.y2,
          (v: string) => {
            updateValue("y2", v);
          },
          "",
          {
            disabled: inputProps.disabled,
          },
          ["px"]
        )}
      </div>
    </div>
  );
};
