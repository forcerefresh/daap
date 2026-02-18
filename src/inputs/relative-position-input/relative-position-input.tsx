import React from "react";
import cx from "classnames";
import {
  IRelativePositionInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import {
  getCheckboxField,
  getNumericFiled,
  getSelectField,
  getUnitNumericFiled,
} from "../input-utils";
import { cloneDeep } from "lodash-es";
import css from "./relative-position-input.module.scss";
import { Label } from "@blueprintjs/core";

export const RelativePositionInputForm: React.FC<
  IRelativePositionInput & IUpdateInput
> = (props) => {
  const { displayName, value, onChange, units = ["px"] } = props;

  return (
    <>
      <div className={cx(css.main, "input120")}>
        <div className="bp5-form-group bp5-inline">
          <Label>{displayName}</Label>
          <div className={css.row}>
            {getUnitNumericFiled(
              "",
              value.value,
              (newValue: string) => {
                const valueClone = cloneDeep(value);
                valueClone.value = newValue;
                onChange(valueClone);
              },
              undefined,
              undefined,
              units,
            )}
          </div>
        </div>
      </div>
    </>
  );
};
