import {
  InputType,
  INumberInput,
  ISelectInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import {
  ITilesSlideAnimation,
  TILES_SLIDE_ANIMATION,
} from "./tiles-slide.types";

export type ITilesSlideTuple = [
  INumberInput<"columns">,
  INumberInput<"rows">,
  ISelectInput<"startFrom">,
  INumberInput<"blur">,
  INumberInput<"opacity">,
  INumberInput<"axisX">,
  INumberInput<"axisY">
];

export const tilesSlideDefinition: IAnimationDefinition<ITilesSlideTuple> = {
  id: TILES_SLIDE_ANIMATION,
  name: "Tiles Slide",
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
    {
      displayName: "Blur",
      helperText: "Initial blur (default 0)",
      propertyName: "blur",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Opacity",
      helperText: "Percentage value (default 0)",
      propertyName: "opacity",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Right/Left",
      helperText: "Slide item right or left (accept negative values)",
      propertyName: "axisX",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Top/Bottom",
      helperText: "Slide item top or bottom (accept negative values)",
      propertyName: "axisY",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const tilesSlideDefaults: ITilesSlideAnimation = {
  id: TILES_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: true,
  hasTimeDistribution: true,
  ease: "none",
  childEase: "none",
  supportedAnimationTypes: ["in", "out"],
  canBeCombined: false,
  // animation properties
  startFrom: "random",
  blur: 0,
  opacity: 0,
  axisX: 0,
  axisY: 0,
  rows: 10,
  columns: 10,
};
