import {
  InputType,
  INumberInput,
  ISelectInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import {
  ISliceSlideAnimation,
  SLICE_SLIDE_ANIMATION,
} from "./slice-slide.types";

export type ISliceSlideTuple = [
  INumberInput<"slices">,
  ISelectInput<"orientation">,
  ISelectInput<"startingPoint">,
  ISelectInput<"from">,
  INumberInput<"distance">
];

export const sliceSlideDefinition: IAnimationDefinition<ISliceSlideTuple> = {
  id: SLICE_SLIDE_ANIMATION,
  name: "Slice Slide",
  form: [
    {
      displayName: "Slices",
      propertyName: "slices",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Orientation",
      propertyName: "orientation",
      inputType: InputType.SELECT,
      value: {} as any,
      defaultValue: {} as any,
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
    {
      displayName: "Start from",
      propertyName: "startingPoint",
      inputType: InputType.SELECT,
      value: {} as any,
      defaultValue: {} as any,
      options: [
        { label: "Random", value: "random" },
        { label: "Center", value: "center" },
        { label: "Start", value: "start" },
        { label: "End", value: "end" },
      ],
    },
    {
      displayName: "Slide from",
      propertyName: "from",
      inputType: InputType.SELECT,
      value: {} as any,
      defaultValue: {} as any,
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" },
      ],
    },
    {
      displayName: "Distance",
      propertyName: "distance",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const sliceSlideDefaults: ISliceSlideAnimation = {
  id: SLICE_SLIDE_ANIMATION,
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
  slices: 5,
  orientation: "horizontal",
  startingPoint: "random",
  distance: 100,
  from: "right",
};
