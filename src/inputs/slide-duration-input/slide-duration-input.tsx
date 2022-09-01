import { FormGroup } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep, noop } from "lodash-es";
import React from "react";
import { getSelectField, getUnitNumericFiled } from "../input-utils";
import {
  IInheritTimeInput,
  IUpdateInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import css from "./slide-duration-input.module.scss";

export const InheritableTimeInputForm: React.FC<
  IInheritTimeInput & IUpdateInput
> = (props) => {
  const {
    displayName,
    propertyName,
    helperText,
    value,
    options,
    onChange = noop,
    parentTime,
  } = props;
  const id = `${propertyName}_inheritable_time`;

  return (
    <FormGroup
      className={classnames(css.main)}
      label={displayName}
      labelFor={id}
      helperText={!!helperText && helperText}
      inline
    >
      {getSelectField("", value.inheritFrom, options, (val: any) => {
        const obj = cloneDeep(value);
        obj.inheritFrom = val;
        onChange(obj);
      })}

      {(value.inheritFrom === "custom" || parentTime !== null) &&
        getUnitNumericFiled(
          "",
          value.inheritFrom === "custom" ? value.customValue : parentTime,
          (val: string) => {
            const obj = cloneDeep(value);
            obj.customValue = val;
            onChange(obj);
          },
          undefined,
          {
            disabled: value.inheritFrom === "inherit",
            style: { width: "100px" },
          },
          ["ms", "s"]
        )}
    </FormGroup>
  );
};
