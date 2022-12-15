import { IAnimationDefinition } from "webslider-sdk/lib/animations/i-animation-types";
import {
  ICheckboxInput,
  InputType,
  INumberInput,
  ISelectInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { FLIP_ANIMATION, IFlipAnimation } from "./flip.types";

export type IFlipTuple = [
  INumberInput<"rotationTime">,
  INumberInput<"pauseTime">,
  ISelectInput<"spinDirection">,
  ICheckboxInput<"rotateFirstElement">
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
    {
      displayName: "Rotate first element",
      propertyName: "rotateFirstElement",
      inputType: InputType.CHECKBOX,
      value: false,
      defaultValue: false,
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
  rotateFirstElement: false,
};
