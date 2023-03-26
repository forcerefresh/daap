import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Label } from "@blueprintjs/core";
import { getUnitNumericFiled } from "../input-utils";
import {
  ICornerRadiusInput,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import css from "./corner-radius-input.module.scss";
import { createInputLabel } from "../input-helpers";

const SMALL_ICON_SIZE = 18;

export const CornerRadiusInputForm: React.FC<
  ICornerRadiusInput & IUpdateInput
> = (props) => {
  const { displayName, propertyName, helperText, value, inputProps, onChange } =
    props;

  const isLinked = !!value.common;

  if (isLinked) {
    value.common = value.common || "0px";
  } else {
    value.tl = value.tl || "0px";
    value.tr = value.tr || "0px";
    value.bl = value.bl || "0px";
    value.br = value.br || "0px";
  }

  const renderLinkBtn = () => {
    return (
      <Button
        disabled={inputProps?.disabled}
        className={css.linkButton}
        minimal
        small
        active={isLinked}
        onClick={() => {
          if (isLinked) {
            const valueClone = cloneDeep(value);
            valueClone.tl = value.common;
            valueClone.tr = value.common;
            valueClone.bl = value.common;
            valueClone.br = value.common;
            delete valueClone.common;
            onChange(valueClone);
          } else {
            const valueClone = cloneDeep(value);
            valueClone.common = value.tl;
            delete valueClone.tl;
            delete valueClone.tr;
            delete valueClone.bl;
            delete valueClone.br;
            onChange(valueClone);
          }
        }}
      >
        <Icon icon="link" iconSize={SMALL_ICON_SIZE} color={"gray"} />
      </Button>
    );
  };

  return (
    <>
      <div className={cx(css.alignHolder, "input60")}>
        <div className="bp3-form-group bp3-inline">
          <Label style={{ width: "45px" }}>
            {createInputLabel(displayName, propertyName)}
          </Label>
          <div className={cx(css.alignHolderInner, "labelAuto")}>
            {!isLinked ? (
              <>
                <div className={cx(css.row, "input65-force")}>
                  {getUnitNumericFiled("TL", value.tl, (tl: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.tl = tl;
                    onChange(valueClone);
                  })}
                  {getUnitNumericFiled(
                    "TR",
                    value.tr,
                    (tr: any) => {
                      const valueClone = cloneDeep(value);
                      valueClone.tr = tr;
                      onChange(valueClone);
                    },
                    ""
                  )}
                  {renderLinkBtn()}
                </div>
                <div className={cx(css.row, "input65-force")}>
                  {getUnitNumericFiled("BL", value.bl, (bl: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.bl = bl;
                    onChange(valueClone);
                  })}
                  {getUnitNumericFiled("BR", value.br, (br: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.br = br;
                    onChange(valueClone);
                  })}
                </div>
              </>
            ) : (
              <div className={cx(css.row, "input70-force")}>
                {getUnitNumericFiled(
                  "",
                  value.common,
                  (common: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.common = common;
                    onChange(valueClone);
                  },
                  undefined,
                  { disabled: inputProps?.disabled }
                )}
                {renderLinkBtn()}
              </div>
            )}
            {helperText && (
              <div className="bp3-form-helper-text">{helperText}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
