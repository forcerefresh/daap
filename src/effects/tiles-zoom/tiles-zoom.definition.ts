import {
  InputType,
  INumberInput,
  ISelectInput,
  ITransformOriginInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { ITilesZoomEffect, tilesZoom } from "./tiles-zoom.types";

export type ITilesZoomTuple = [
  INumberInput<"columns">,
  INumberInput<"rows">,
  ISelectInput<"startFrom">,
  ITransformOriginInput<"transformOrigin">
];

export const tilesZoomDefinition: IEffectDefinition<ITilesZoomTuple> = {
  id: tilesZoom,
  name: "Tiles Zoom",
  form: [
    {
      displayName: "Columns",
      helperText: "Number of columns (default 10)",
      propertyName: "columns",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Rows",
      helperText: "Number of rows (default 10)",
      propertyName: "rows",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Start from",
      propertyName: "startFrom",
      inputType: InputType.SELECT,
      value: {} as any,
      defaultValue: {} as any,
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
      value: {} as any,
      defaultValue: {} as any,
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
  canBeCombined: false,
  // effect properties
  rows: 10,
  columns: 10,
  transformOrigin: { x: 50, y: 50 },
  startFrom: "random",
};
