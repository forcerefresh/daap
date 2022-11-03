import {
  InputType,
  INumberInput,
  ISelectInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import { FLIP_ANIMATION, IFlipAnimation } from "./flip.types";

export type IFlipTuple = [
  INumberInput<"rotationTime">,
  INumberInput<"pauseTime">,
  ISelectInput<"spinDirection">
];

export const flipDefinition: IAnimationDefinition<IFlipTuple> = {
  id: FLIP_ANIMATION,
  name: "Flip",
  form: [
    {
      displayName: "Rotation time",
      propertyName: "rotationTime",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Pause time",
      propertyName: "pauseTime",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Spin direction",
      propertyName: "spinDirection",
      inputType: InputType.SELECT,
      value: {} as any,
      defaultValue: {} as any,
      options: [
        { label: "Clockwise", value: "cc" },
        { label: "Counterclockwise", value: "ccw" },
      ],
    },
  ],
};

export const flipDefaults: IFlipAnimation = {
  id: FLIP_ANIMATION,
  hasDelay: true,
  hasDuration: false,
  hasOwnDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["animation"],
  canBeCombined: false,
  // animation properties
  rotationTime: 1000,
  pauseTime: 500,
  spinDirection: "cc",
};
