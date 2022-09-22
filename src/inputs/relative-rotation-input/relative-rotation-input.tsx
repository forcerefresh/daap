import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash";
import {
  getCheckboxField,
  getNumericFiled,
  getSelectField,
} from "../input-utils";
import {
  IRelativeRotationInput,
  IUpdateInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { Label } from "@blueprintjs/core";
import css from "./relative-rotation-input.module.scss";

const RELATIVE_POSITION_OPTIONS = [
  { label: "rel", value: "rel" },
  { label: "abs", value: "abs" },
];

const RELATIVE_ROTATION_OPTIONS = [
  { label: "cw", value: "_cw" },
  { label: "ccw", value: "_ccw" },
  { label: "short", value: "_short" },
];

export const RelativeRotationInputForm: React.FC<
  IRelativeRotationInput & IUpdateInput
> = (props) => {
  const { displayName, value, onChange } = props;

  return (
    <>
      <div className={cx(css.main, "input60")}>
        <div className="bp3-form-group bp3-inline">
          <Label>{displayName}</Label>

          {value.enabled ? (
            <div className={css.row}>
              {getCheckboxField("", value.enabled, (newValue: any) => {
                const valueClone = cloneDeep(value);
                valueClone.enabled = newValue;
                onChange(valueClone);
              })}
              {getSelectField(
                "",
                value.position,
                RELATIVE_POSITION_OPTIONS,
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
          ) : (
            <div className={css.row}>
              {getCheckboxField("", value.enabled, (newValue: any) => {
                const valueClone = cloneDeep(value);
                valueClone.enabled = newValue;
                onChange(valueClone);
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
