import React from "react";
import cx from "classnames";
import { cloneDeep } from "lodash-es";
import { Label } from "@blueprintjs/core";
import { getSelectField } from "../input-utils";
import {
  ICoverPlacementInput,
  ILayoutChildrenInput,
  IUpdateInput,
} from "../types";
//import css from "./layout-childern-input.module.scss";

const LAYOUT_TYPE_OPTIONS = [
  { label: "column", value: "column" },
  { label: "row", value: "row" },
  { label: "inline", value: "inline" },
];

const ALIGN_OPTIONS = [
  { label: "start", value: "start" },
  { label: "center", value: "center" },
  { label: "end", value: "end" },
];

const JUSTIFY_OPTIONS = [
  { label: "start", value: "start" },
  { label: "center", value: "center" },
  { label: "end", value: "end" },
];

export const LayoutChildrenInputForm: React.FC<
  ILayoutChildrenInput & IUpdateInput
> = (props) => {
  const { value, onChange } = props;

  return (
    <>
      <div className="input60">
        {getSelectField("Fit", value.type, LAYOUT_TYPE_OPTIONS, (type: any) => {
          const valueClone = cloneDeep(value);
          valueClone.type = type;
          onChange(valueClone);
        })}
      </div>

      <div className={cx("input60")}>
        {getSelectField("Align", value.align, ALIGN_OPTIONS, (align: any) => {
          const valueClone = cloneDeep(value);
          valueClone.align = align;
          onChange(valueClone);
        })}

        {getSelectField(
          "Justify",
          value.justify,
          JUSTIFY_OPTIONS,
          (justify: any) => {
            const valueClone = cloneDeep(value);
            valueClone.justify = justify;
            onChange(valueClone);
          }
        )}
      </div>
    </>
  );
};
