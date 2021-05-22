import { InputType } from "../../inputs/types";
import {
  ITilesSlideInnerEffect,
  tilesSlideInner,
} from "./tiles-slide-inner.types";

export const tilesSlideInnerDefinition = {
  id: tilesSlideInner,
  name: "Tiles Slide Inner",
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
      displayName: "Start From",
      propertyName: "startFrom",
      inputType: InputType.SELECT,
      options: [
        { label: "Random", value: "random" },
        { label: "Center", value: "center" },
        { label: "Horizontal Center", value: "horizontal-center" },
        { label: "Vertical Center", value: "vertical-center" },
        { label: "Edges", value: "edges" },
        { label: "Horizontal Edges", value: "horizontal-edges" },
        { label: "Vertical Edges", value: "vertical-edges" },
        { label: "Top Left", value: "top-left" },
        { label: "Top Right", value: "top-right" },
        { label: "Bottom Left", value: "bottom-left" },
        { label: "Bottom Right", value: "bottom-right" },
      ],
    },
    {
      displayName: "Blur",
      helperText: "Initial blur (default 0)",
      propertyName: "blur",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Opacity",
      helperText: "Percentage value (default 0)",
      propertyName: "opacity",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Right/Left",
      helperText: "Slide item right or left (accept negative values)",
      propertyName: "axisX",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Top/Bottom",
      helperText: "Slide item top or bottom (accept negative values)",
      propertyName: "axisY",
      inputType: InputType.NUMBER,
    },
  ],
};

export const sliceSlideInnerDefaults: ITilesSlideInnerEffect = {
  id: tilesSlideInner,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: true,
  hasTimeDistribution: true,
  ease: "none",
  childEase: "none",
  supportedEffectTypes: ["in", "out"],
  // specific to this effect
  startFrom: "random",
  blur: 0,
  opacity: 0,
  axisX: 0,
  axisY: 0,
  rows: 10,
  columns: 10,
};
