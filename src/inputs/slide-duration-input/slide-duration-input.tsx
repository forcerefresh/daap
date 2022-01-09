import { FormGroup } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep, noop } from "lodash-es";
import React from "react";
import { SlideDurationOptions } from "../../store/types";
import { getNumericFiled, getSelectField } from "../input-utils";
import { ISlideDurationInput, IUpdateInput } from "../types";
import css from "./slide-duration-input.module.scss";

export const SlideDurationInputForm: React.FC<
  ISlideDurationInput & IUpdateInput
> = (props) => {
  const {
    displayName,
    propertyName,
    helperText,
    value,
    onChange = noop,
    commonDuration,
  } = props;
  const id = `${propertyName}_slide_duration`;

  return (
    <FormGroup
      className={classnames(css.main)}
      label={displayName}
      labelFor={id}
      helperText={!!helperText && helperText}
      inline
    >
      {getSelectField(
        "Duration",
        value.inheritFrom,
        SlideDurationOptions,
        (val: "inherit" | "custom") => {
          const obj = cloneDeep(value);
          obj.inheritFrom = val;
          onChange(obj);
        }
      )}

      {getNumericFiled(
        " ",
        value.inheritFrom === "inherit" ? commonDuration : value.customValue,
        (val: number) => {
          const obj = cloneDeep(value);
          obj.customValue = val;
          onChange(obj);
        },
        undefined,
        { disabled: value.inheritFrom === "inherit" }
      )}
    </FormGroup>
  );
};
