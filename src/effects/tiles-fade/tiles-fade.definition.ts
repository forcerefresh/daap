import {
  InputType,
  INumberInput,
  ISelectInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { TILES_FADE_ANIMATION, ITilesFadeEffect } from "./tiles-fade.types";

export type ITilesFadeTuple = [
  INumberInput<"columns">,
  INumberInput<"rows">,
  ISelectInput<"startFrom">
];

export const tilesFadeDefinition: IEffectDefinition<ITilesFadeTuple> = {
  id: TILES_FADE_ANIMATION,
  name: "Tiles Fade",
  form: [
    {
      displayName: "Tile column",
      helperText: "Default column value (default 10)",
      propertyName: "columns",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Tile row",
      helperText: "Default row value (default 10)",
      propertyName: "rows",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Start From",
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
  ],
};

export const tilesFadeDefaults: ITilesFadeEffect = {
  id: TILES_FADE_ANIMATION,
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
