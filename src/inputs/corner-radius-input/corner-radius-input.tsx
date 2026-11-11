import React, { useCallback, useMemo } from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Label } from "@blueprintjs/core";
import { getUnitNumericFiled } from "../input-utils";
import {
  ICornerRadiusInput,
  ICornerRadiusValue,
  IUpdateInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { ICON_COLORS } from "../input-icon-colors";
import css from "./corner-radius-input.module.scss";
import { createInputLabel } from "../input-helpers";

const SMALL_ICON_SIZE = 18;

export const CornerRadiusInputForm: React.FC<
  ICornerRadiusInput & IUpdateInput
> = (props) => {
  const { displayName, propertyName, helperText, value, inputProps, onChange } =
    props;

  const isLinked = typeof value === "string";

  const internalValue: ICornerRadiusValue & { common?: string } =
    useMemo(() => {
      if (isLinked) {
        return { common: value };
      } else {
        return {
          tl: value.tl || "0px",
          tr: value.tr || "0px",
          bl: value.bl || "0px",
          br: value.br || "0px",
        };
      }
    }, [value, isLinked]);

  const renderLinkBtn = useCallback(() => {
    return (
      <Button
        disabled={inputProps?.disabled}
        className={css.linkButton}
        minimal
        small
        active={isLinked}
        onClick={() => {
          if (isLinked) {
            onChange({
              tl: internalValue.common,
              tr: internalValue.common,
              bl: internalValue.common,
              br: internalValue.common,
            });
          } else {
            onChange(internalValue.tl ?? "0px");
          }
        }}
      >
        <Icon icon="link" iconSize={SMALL_ICON_SIZE} color={ICON_COLORS.inactive} />
      </Button>
    );
  }, [inputProps?.disabled, isLinked, onChange, internalValue]);

  return (
    <>
      <div className={cx(css.alignHolder, "input60")}>
        <div className="bp5-form-group bp5-inline">
          <Label style={{ width: "45px" }}>
            {createInputLabel(displayName, propertyName)}
          </Label>
          <div className={cx(css.alignHolderInner, "labelAuto")}>
            {!isLinked ? (
              <>
                <div className={cx(css.row, "input80-force")}>
                  {getUnitNumericFiled("TL", internalValue.tl, (tl: any) => {
                    const valueClone = cloneDeep(internalValue);
                    valueClone.tl = tl;
                    onChange(valueClone);
                  })}
                  {getUnitNumericFiled(
                    "TR",
                    internalValue.tr,
                    (tr: any) => {
                      const valueClone = cloneDeep(internalValue);
                      valueClone.tr = tr;
                      onChange(valueClone);
                    },
                    ""
                  )}
                  {renderLinkBtn()}
                </div>
                <div className={cx(css.row, "input80-force")}>
                  {getUnitNumericFiled("BL", internalValue.bl, (bl: any) => {
                    const valueClone = cloneDeep(internalValue);
                    valueClone.bl = bl;
                    onChange(valueClone);
                  })}
                  {getUnitNumericFiled("BR", internalValue.br, (br: any) => {
                    const valueClone = cloneDeep(internalValue);
                    valueClone.br = br;
                    onChange(valueClone);
                  })}
                </div>
              </>
            ) : (
              <div className={cx(css.row, "input80-force")}>
                {getUnitNumericFiled(
                  "",
                  internalValue.common ?? "0px",
                  (common: string) => {
                    onChange(common);
                  },
                  undefined,
                  { disabled: inputProps?.disabled }
                )}
                {renderLinkBtn()}
              </div>
            )}
            {helperText && (
              <div className="bp5-form-helper-text">{helperText}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
