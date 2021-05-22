import { InputType } from "../../inputs/types";
import { ISlideEffect, slide } from "./slide.types";

export const slideDefinition = {
  id: slide,
  name: "Slide",
  form: [
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

export const slideDefaults: ISlideEffect = {
  id: slide,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  // specific this effect
  distance: 100,
  from: "right",
};
