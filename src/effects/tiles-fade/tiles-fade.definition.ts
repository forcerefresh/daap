import { InputType } from "../../inputs/types";
import { Easings } from "../types";
import { tilesFade, ITilesFadeEffect } from "./tiles-fade.types";

export const tilesFadeDefinition = {
  id: tilesFade,
  name: "Tiles Fade",
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
        { label: "End", value: "end" },
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

export const tilesFadeDefaults: ITilesFadeEffect = {
  id: tilesFade,
  hasDelay: true,
  hasDuration: true,
  hasEasing: true,
  row: 10,
  column: 10,
  pointOfView: "random",
  transformOrigin: { x: 50, y: 50 },
  easing: Easings.Power0,
  customEasing: null,
};
