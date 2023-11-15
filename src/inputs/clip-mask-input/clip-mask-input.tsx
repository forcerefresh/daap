import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { getUnitNumericFiled } from "../input-utils";
import {
  IClipMaskInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./clip-mask-input.module.scss";
import { Label } from "@blueprintjs/core";
import { createInputLabel } from "../input-helpers";

export const ClipMaskInputForm: React.FC<IClipMaskInput & IUpdateInput> = (
  props
) => {
  const { displayName, helperText, propertyName, value, inputProps, onChange } =
    props;
  const disabled = inputProps?.disabled;

  const points = value.point;

  return (
    <>
      <div className={cx(css.alignHolder, "input60")}>
        <div className="bp5-form-group bp5-inline">
          <Label style={{ width: "45px" }}>
            {createInputLabel(displayName, propertyName)}
          </Label>
          <div className={cx(css.alignHolderInner, "labelAuto")}>
            {points.map((point, idx) => {
              return (
                <div>
                  <div className={cx(css.row, "input65-force")}>
                    <Label>{idx}.</Label>
                    {getUnitNumericFiled(
                      "X",
                      point.x,
                      (x: any) => {
                        const valueClone = cloneDeep(value);
                        valueClone.point[idx].x = x;
                        onChange(valueClone);
                      },
                      "",
                      { disabled }
                    )}
                    {getUnitNumericFiled(
                      "Y",
                      point.y,
                      (y: any) => {
                        const valueClone = cloneDeep(value);
                        valueClone.point[idx].y = y;
                        onChange(valueClone);
                      },
                      "",
                      { disabled }
                    )}
                  </div>
                </div>
              );
            })}

            {helperText && (
              <div className="bp5-form-helper-text">{helperText}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
