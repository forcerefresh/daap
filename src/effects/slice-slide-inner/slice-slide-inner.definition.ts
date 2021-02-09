import { InputType } from "../../inputs/types";
import {
  ISliceSlideInnerEffect,
  sliceSlideInner,
} from "./slice-slide-inner.types";

export const sliceSlideInnerDefinition = {
  id: sliceSlideInner,
  name: "Slice Slide Inner",
  form: [
    {
      displayName: "Columns",
      helperText: "Number of columns (default 10)",
      propertyName: "columns",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Rows",
      helperText: "Number of rows (default 10)",
      propertyName: "rows",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Start from",
      helperText: null,
      propertyName: "startFrom",
      inputType: InputType.SELECT,
      options: [
        { label: "Random", value: "random" },
        { label: "Center", value: "center" },
        { label: "Start", value: "start" },
        { label: "End", value: "end" },
      ],
    },
    {
      displayName: "Blur",
      helperText: "Increase to blur item (default 0)",
      propertyName: "filter",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Right/Left",
      helperText: "Move item background right or left",
      propertyName: "axisX",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Top/Bottom",
      helperText: "Move item background top or bottom",
      propertyName: "axisY",
      inputType: InputType.NUMBER,
    },
  ],
};

export const sliceSlideInnerDefaults: ISliceSlideInnerEffect = {
  id: sliceSlideInner,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: true,
  hasTimeDistribution: true,
  ease: "none",
  childEase: "none",
  // specific to this effect
  startFrom: "random",
  filter: 0,
  axisX: 0,
  axisY: 0,
  rows: 10,
  columns: 10,
};
