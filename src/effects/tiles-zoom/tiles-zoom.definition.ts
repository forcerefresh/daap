import { InputType } from "../../inputs/types";
import { Easings } from "../types";
import { ITilesZoomEffect, tilesZoom } from "./tiles-zoom.types";

export const tilesZoomDefinition = {
  id: tilesZoom,
  name: "Tiles Zoom",
  form: [
    {
      displayName: "Tile column",
      helperText: "Default column value (default 10)",
      propertyName: "column",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Tile row",
      helperText: "Default row value (default 10)",
      propertyName: "row",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "From point",
      propertyName: "pointOfView",
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
  hasEasing: true,
  row: 10,
  column: 10,
  transformOrigin: { x: 50, y: 50 },
  pointOfView: "random",
  easing: Easings.Power0,
  customEasing: null,
};
