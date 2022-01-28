import { InputType, INumberInput, ISelectInput } from "../../inputs/types";
import { IEffectDefinition } from "../types";
import { ISlideEffect, slide } from "./slide.types";

export type ISlideTuple = [ISelectInput<"from">, INumberInput<"distance">];

export const slideDefinition: IEffectDefinition<ISlideTuple> = {
  id: slide,
  name: "Slide",
  form: [
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

export const slideDefaults: ISlideEffect = {
  id: slide,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: true,
  // specific this effect
  distance: 100,
  from: "right",
};
