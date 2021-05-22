import { InputType } from "../../inputs/types";
import { ITilesZoomEffect, tilesZoom } from "./tiles-zoom.types";

export const tilesZoomDefinition = {
  id: tilesZoom,
  name: "Tiles Zoom",
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
      displayName: "Scale center",
      helperText: "Center will keep same position in a time",
      propertyName: "transformOrigin",
      inputType: InputType.TRANSFORM_ORIGIN,
    },
  ],
};

export const tilesZoomDefaults: ITilesZoomEffect = {
  id: tilesZoom,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: true,
  hasTimeDistribution: true,
  ease: "none",
  childEase: "none",
  supportedEffectTypes: ["in", "out"],
  // specific to this effect
  rows: 10,
  columns: 10,
  transformOrigin: { x: 50, y: 50 },
  startFrom: "random",
};
