import React from "react";
import cx from "classnames";
import { IRelativePositionInput, IUpdateInput } from "../types";
import { getNumericFiled, getSelectField } from "../input-utils";
import { cloneDeep } from "lodash";
import css from "./relative-position-input.module.scss";
import { Label } from "@blueprintjs/core";

const RELATIVE_POSTITION_OPTIONS = [
  { label: "rel", value: "rel" },
  { label: "abs", value: "abs" },
];

export const RelativePositionInputForm: React.FC<
  IRelativePositionInput & IUpdateInput
> = (props) => {
  const { displayName, value, onChange } = props;

  return (
    <>
      <div className={cx("input60")}>
        <div className="bp3-form-group bp3-inline">
          <Label>{displayName}</Label>
          <div className={css.row}>
            {getSelectField(
              "",
              value.position,
              RELATIVE_POSTITION_OPTIONS,
              (position: any) => {
                const valueClone = cloneDeep(value);
                valueClone.position = position;
                onChange(valueClone);
              }
            )}
            {getNumericFiled("", value.value, (newValue: any) => {
              const valueClone = cloneDeep(value);
              valueClone.value = newValue;
              onChange(valueClone);
            })}
          </div>
        </div>
      </div>
    </>
  );
};
