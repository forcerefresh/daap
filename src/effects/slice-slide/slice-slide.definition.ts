import { InputType } from "../../inputs/types";
import { ISliceSlideEffect, sliceSlide } from "./slice-slide.types";

export const sliceSlideDefinition = {
  id: sliceSlide,
  name: "Slice Slide",
  form: [
    {
      displayName: "Slices",
      helperText: null,
      propertyName: "slices",
      inputType: InputType.NUMBER,
    },
    {
      displayName: "Orientation",
      helperText: null,
      propertyName: "orientation",
      inputType: InputType.SELECT,
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
    {
      displayName: "Start from",
      helperText: null,
      propertyName: "startingPoint",
      inputType: InputType.SELECT,
      options: [
        { label: "Random", value: "random" },
        { label: "Center", value: "center" },
        { label: "Start", value: "start" },
        { label: "End", value: "end" },
      ],
    },
    {
      displayName: "Slide from",
      helperText: null,
      propertyName: "from",
      inputType: InputType.SELECT,
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" },
      ],
    },
    {
      displayName: "Distance",
      helperText: null,
      propertyName: "distance",
      inputType: InputType.NUMBER,
    },
  ],
};

export const sliceSlideDefaults: ISliceSlideEffect = {
  id: sliceSlide,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  ease: "none",
  customEase: null,
  // specific to this effect
  slices: 5,
  orientation: "horizontal",
  startingPoint: "random",
  distance: 100,
  from: "right",
};
