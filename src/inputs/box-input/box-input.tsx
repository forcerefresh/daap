import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Label } from "@blueprintjs/core";
import { getUnitNumericFiled } from "../input-utils";
import {
  IBoxInput,
  IUpdateInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./box-input.module.scss";

const SMALL_ICON_SIZE = 18;

export const BoxInputForm: React.FC<IBoxInput & IUpdateInput> = (props) => {
  const { displayName, value, onChange } = props;

  const isLinked = !!value.common;

  if (isLinked) {
    value.common = value.common || "0px";
  } else {
    value.t = value.t || "0px";
    value.r = value.r || "0px";
    value.l = value.l || "0px";
    value.b = value.b || "0px";
  }

  const renderLinkBtn = () => {
    return (
      <Button
        className={css.linkButton}
        minimal
        small
        active={isLinked}
        onClick={() => {
          if (isLinked) {
            const valueClone = cloneDeep(value);
            valueClone.t = value.common;
            valueClone.r = value.common;
            valueClone.l = value.common;
            valueClone.b = value.common;
            delete valueClone.common;
            onChange(valueClone);
          } else {
            const valueClone = cloneDeep(value);
            valueClone.common = value.t;
            delete valueClone.t;
            delete valueClone.r;
            delete valueClone.b;
            delete valueClone.l;
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
          <Label>{displayName}</Label>
          <div className={cx(css.alignHolderInner, "labelAuto")}>
            {!isLinked ? (
              <>
                <div className={cx(css.row, "input70-force")}>
                  {getUnitNumericFiled(
                    "",
                    value.t,
                    (t: any) => {
                      const valueClone = cloneDeep(value);
                      valueClone.t = t;
                      onChange(valueClone);
                    },
                    "",
                    { style: { marginLeft: "60px" } }
                  )}
                  {renderLinkBtn()}
                </div>
                <div className={cx(css.row, "input70-force")}>
                  {getUnitNumericFiled("", value.l, (l: any) => {
                    const valueClone = cloneDeep(value);
                    valueClone.l = l;
                    onChange(valueClone);
                  })}
                  {getUnitNumericFiled(
                    "",
                    value.r,
                    (r: any) => {
                      const valueClone = cloneDeep(value);
                      valueClone.r = r;
                      onChange(valueClone);
                    },
                    "",
                    { style: { marginLeft: "40px" } }
                  )}
                </div>
                <div className={cx(css.row, "input70-force")}>
                  {getUnitNumericFiled(
                    "",
                    value.b,
                    (b: any) => {
                      const valueClone = cloneDeep(value);
                      valueClone.b = b;
                      onChange(valueClone);
                    },
                    "",
                    { style: { marginLeft: "60px" } }
                  )}
                </div>
              </>
            ) : (
              <div className={cx(css.row, "input70-force")}>
                {getUnitNumericFiled("", value.common, (common: any) => {
                  const valueClone = cloneDeep(value);
                  valueClone.common = common;
                  onChange(valueClone);
                })}
                {renderLinkBtn()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
