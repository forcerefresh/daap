import { InputType } from "../../inputs/types";
import { tilesFade, ITilesFadeEffect } from "./tiles-fade.types";

export const tilesFadeDefinition = {
  id: tilesFade,
  name: "Tiles Fade",
  form: [
    {
      displayName: "Tile column",
      helperText: "Default column value (default 10)",
      propertyName: "columns",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Tile row",
      helperText: "Default row value (default 10)",
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
  ],
};

export const tilesFadeDefaults: ITilesFadeEffect = {
  id: tilesFade,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: true,
  hasTimeDistribution: true,
  ease: "none",
  childEase: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: false,
  // effect properties
  rows: 10,
  columns: 10,
  startFrom: "random",
};
