import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Label } from "@blueprintjs/core";
import { getSelectField } from "../input-utils";
import { ICoverPlacementInput, IUpdateInput } from "../types";
import css from "./cover-placement.module.scss";

const HOR_POSITION_OPTIONS = [
  { label: "left", value: "left" },
  { label: "center", value: "center" },
  { label: "right", value: "right" },
];

const VER_POSITION_OPTIONS = [
  { label: "top", value: "top" },
  { label: "center", value: "center" },
  { label: "bottom", value: "bottom" },
];

const RELATIVE_TO_OPTIONS = [
  { label: "page", value: "page" },
  { label: "stage", value: "stage" },
  { label: "guidelines", value: "guidelines" },
];

const SIZE_OPTIONS = [
  { label: "cover", value: "cover" },
  { label: "contain", value: "contain" },
  { label: "fit", value: "fit" },
];

export const CoverPlacementInputForm: React.FC<
  ICoverPlacementInput & IUpdateInput
> = (props) => {
  const { value, onChange } = props;

  return (
    <>
      <div className="input60">
        {getSelectField(
          "Relative to",
          value.relativeTo,
          RELATIVE_TO_OPTIONS,
          (relativeTo: any) => {
            const valueClone = cloneDeep(value);
            valueClone.relativeTo = relativeTo;
            onChange(valueClone);
          }
        )}
      </div>

      <div className={cx(css.alignHolder, "input60")}>
        <div className="bp3-form-group bp3-inline">
          <Label>Align</Label>
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

      <div className="input60">
        {getSelectField("Size", value.size, SIZE_OPTIONS, (size: any) => {
          const valueClone = cloneDeep(value);
          valueClone.size = size;
          onChange(valueClone);
        })}
      </div>

      <hr />
    </>
  );
};
