import { Button, FormGroup, Icon, InputGroup, Intent } from "@blueprintjs/core";
import { isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useState } from "react";
import {
  getNumericFiled,
  getSelectField,
  getSizeLayoutField,
} from "../input-utils";
import { IEdgeInput, IUpdateInput } from "../types";
import css from "./snap-input.module.scss";

const RELATIVE_TO_OPTIONS = [
  { label: "Page", value: "page" },
  { label: "Stage", value: "stage" },
  { label: "Guidelines", value: "guidelines" },
];

const EDGE_OPTIONS = [
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
  { label: "Top-Left", value: "top-left" },
  { label: "Top-Right", value: "top-right" },
  { label: "Bottom-Left", value: "bottom-left" },
  { label: "Bottom-Right", value: "bottom-right" },
];

export const SnapInputForm: React.FC<IEdgeInput & IUpdateInput> = (props) => {
  const { value, onChange = noop, inputProps = {} } = props;

  return (
    <div className={css.main}>
      {getSelectField(
        "Relative to",
        value.relativeTo,
        RELATIVE_TO_OPTIONS,
        (newRelativeTo) => {
          onChange({ ...value, relativeTo: newRelativeTo });
        },
        { disabled: inputProps.disablePosition }
      )}
      {getSelectField(
        "Snap to",
        value.edge,
        EDGE_OPTIONS,
        (newEdge) => {
          onChange(
            { ...value, edge: newEdge },
            { disabled: inputProps.disablePosition }
          );
        },
        { disabled: inputProps.disablePosition }
      )}
      {getSizeLayoutField(
        "Size",
        { width: value.width, height: value.height },
        (newWH) => {
          onChange({ ...value, width: newWH.width, height: newWH.height });
        },
        { disabled: inputProps.selfSize }
      )}
      {getNumericFiled(
        "Gap",
        value.gap,
        (newGap) => {
          onChange({ ...value, gap: newGap });
        },
        "",
        { disabled: inputProps.disablePosition }
      )}
    </div>
  );
};
