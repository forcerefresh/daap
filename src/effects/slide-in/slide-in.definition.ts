import { InputType } from "../../inputs/types";
import { ISlideInEffect, slideIn } from "./slide-in.types";

export const slideInDefinition = {
  id: slideIn,
  name: "Slide In",
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

export const slideInDefaults: ISlideInEffect = {
  id: slideIn,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  // specific this effect
  distance: 100,
  from: "right",
};
