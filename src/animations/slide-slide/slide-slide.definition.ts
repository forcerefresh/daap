import {
  InputType,
  ISelectInput,
  IUnitsNumberInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import {
  ISlideSlideAnimation,
  SLIDE_SLIDE_ANIMATION,
} from "./slide-slide.types";

export type ISlideSlideTuple = [
  ISelectInput<"from">,
  IUnitsNumberInput<"distance">
];

export const slideSlideDefinition: IAnimationDefinition<ISlideSlideTuple> = {
  id: SLIDE_SLIDE_ANIMATION,
  name: "Slide",
  form: [
    {
      displayName: "Direction",
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
      inputType: InputType.UNITS_NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const slideSlideDefaults: ISlideSlideAnimation = {
  id: SLIDE_SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["slide"],
  canBeCombined: true,
  library: "animejs",
  // this animation has no configuration
  distance: "100%",
  from: "right",
};
