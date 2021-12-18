import { Button, FormGroup, Icon, InputGroup, Intent } from "@blueprintjs/core";
import { isEqual, noop, pick } from "lodash-es";
import React, { useEffect, useState } from "react";
import {
  getNumericFiled,
  getSelectField,
  getSizeLayoutField,
} from "../input-utils";
import { IEdgeInput, IUpdateInput } from "../types";
import css from "./edge-input.module.scss";

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

export const EdgeInputForm: React.FC<IEdgeInput & IUpdateInput> = (props) => {
  const { value, onChange = noop } = props;

  return (
    <div className={css.main}>
      {getSelectField(
        "Relative to",
        value.relativeTo,
        RELATIVE_TO_OPTIONS,
        (newRelativeTo) => {
          onChange({ ...value, relativeTo: newRelativeTo });
        }
      )}
      {getSelectField("Snap to", value.edge, EDGE_OPTIONS, (newEdge) => {
        onChange({ ...value, edge: newEdge });
      })}
      {getSizeLayoutField(
        "Size",
        { width: value.width, height: value.height },
        (newWH) => {
          onChange({ ...value, width: newWH.width, height: newWH.height });
        }
      )}
      {getNumericFiled("Gap", value.gap, (newGap) => {
        onChange({ ...value, gap: newGap });
      })}
    </div>
  );
};
