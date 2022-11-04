import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Label } from "@blueprintjs/core";
import { getSelectField } from "../input-utils";
import {
  ICoverPlacementInput,
  IUpdateInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import css from "./cover-placement.module.scss";

const HOR_POSITION_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const VER_POSITION_OPTIONS = [
  { label: "Top", value: "top" },
  { label: "Center", value: "center" },
  { label: "Bottom", value: "bottom" },
];

const SIZE_OPTIONS = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Fill", value: "fill" },
];

export const CoverPlacementInputForm: React.FC<
  ICoverPlacementInput & IUpdateInput
> = (props) => {
  const { displayName, value, onChange, inputProps } = props;

  return (
    <>
      <div className="input60">
        {getSelectField(displayName, value.size, SIZE_OPTIONS, (size: any) => {
          const valueClone = cloneDeep(value);
          valueClone.size = size;
          onChange(valueClone);
        })}
      </div>

      {!inputProps?.hidePosition && (
        <div className={cx(css.alignHolder, "input60")}>
          <div className="bp3-form-group bp3-inline">
            <Label>Fit align</Label>
            <div className={cx(css.alignHolderInner, "labelAuto")}>
              {getSelectField(
                "H",
                value.positionHorizontal,
                HOR_POSITION_OPTIONS,
                (positionHorizontal: any) => {
                  const valueClone = cloneDeep(value);
                  valueClone.positionHorizontal = positionHorizontal;
                  onChange(valueClone);
                }
              )}

              {getSelectField(
                "V",
                value.positionVertical,
                VER_POSITION_OPTIONS,
                (positionVertical: any) => {
                  const valueClone = cloneDeep(value);
                  valueClone.positionVertical = positionVertical;
                  onChange(valueClone);
                }
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
