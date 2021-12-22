import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Label } from "@blueprintjs/core";
import { getNumericFiled } from "../input-utils";
import { IGridPlacementInput, IUpdateInput } from "../types";
import css from "./grid-placement.module.scss";

export const GridPlacementInputForm: React.FC<
  IGridPlacementInput & IUpdateInput
> = (props) => {
  const { value, onChange, inputProps = {} } = props;

  return (
    <>
      <div className="input60">
        {getNumericFiled(
          "Left",
          value.left,
          (left: any) => {
            const valueClone = cloneDeep(value);
            valueClone.left = left;
            onChange(valueClone);
          },
          "",
          { disabled: inputProps.disablePosition }
        )}
      </div>

      <div className="input60">
        {getNumericFiled("Width", value.right, (right: any) => {
          const valueClone = cloneDeep(value);
          valueClone.right = right;
          onChange(valueClone);
        })}
      </div>

      <div className="input60">
        {getNumericFiled(
          "Top",
          value.top,
          (top: any) => {
            const valueClone = cloneDeep(value);
            valueClone.top = top;
            onChange(valueClone);
          },
          "",
          { disabled: inputProps.disablePosition }
        )}
      </div>

      <div className="input60">
        {getNumericFiled("Height", value.bottom, (bottom: any) => {
          const valueClone = cloneDeep(value);
          valueClone.bottom = bottom;
          onChange(valueClone);
        })}
      </div>

      <hr />
    </>
  );
};
