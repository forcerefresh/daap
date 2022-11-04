import {
  InputType,
  INumberInput,
  ITransformOriginInput,
} from "webslider-sdk2/lib/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import { IKenBurnsAnimation, KEN_BURNS_ANIMATION } from "./ken-burns.types";

export type IKenBurnsTuple = [
  INumberInput<"scaleFactor">,
  ITransformOriginInput<"transformOrigin">
];

export const kenBurnsDefinition: IAnimationDefinition<IKenBurnsTuple> = {
  id: KEN_BURNS_ANIMATION,
  name: "Ken burns",
  form: [
    {
      displayName: "Scale factor",
      helperText: "Percentage value (default 10%)",
      propertyName: "scaleFactor",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
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

export const kenBurnsDefaults: IKenBurnsAnimation = {
  id: KEN_BURNS_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out"],
  canBeCombined: false,
  // specific to this animation
  scaleFactor: 10,
  transformOrigin: { x: 50, y: 50 },
};
