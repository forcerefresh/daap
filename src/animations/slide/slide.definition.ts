import {
  InputType,
  INumberInput,
  ISelectInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationDefinition } from "webslider-sdk/lib/animations/i-animation-types";
import { ISlideAnimation, SLIDE_ANIMATION } from "./slide.types";

export type ISlideTuple = [ISelectInput<"from">, INumberInput<"distance">];

export const slideDefinition: IAnimationDefinition<ISlideTuple> = {
  id: SLIDE_ANIMATION,
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
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const slideDefaults: ISlideAnimation = {
  id: SLIDE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "event"],
  canBeCombined: true,
  // specific this animation
  distance: 100,
  from: "right",
};
