import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash";
import { getNumericFiled, getSelectField } from "../input-utils";
import { IRelativeRotationInput, IUpdateInput } from "../types";
import { Label } from "@blueprintjs/core";
import css from "./relative-rotation-input.module.scss";

const RELATIVE_POSTITION_OPTIONS = [
  { label: "rel", value: "rel" },
  { label: "abs", value: "abs" },
];

const RELATIVE_ROTATION_OPTIONS = [
  { label: "_cw", value: "_cw" },
  { label: "_ccw", value: "_ccw" },
  { label: "_short", value: "_short" },
];

export const RelativeRotationInputForm: React.FC<
  IRelativeRotationInput & IUpdateInput
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
            {getSelectField(
              "",
              value.direction,
              RELATIVE_ROTATION_OPTIONS,
              (direction: any) => {
                const valueClone = cloneDeep(value);
                valueClone.direction = direction;
                onChange(valueClone);
              }
            )}
          </div>
        </div>
      </div>
    </>
  );
};
