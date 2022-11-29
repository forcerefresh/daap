import {
  InputType,
  INumberInput,
  ISplitInput,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationDefinition } from "webslider-sdk/lib/animations/i-animation-types";
import { ISplitAnimation, SPLIT_ANIMATION } from "./split.types";

export type ISplitTuple = [
  ISplitInput<"split">,
  INumberInput<"rotation">,
  INumberInput<"randomStrength">
];

export const splitDefinition: IAnimationDefinition<ISplitTuple> = {
  id: SPLIT_ANIMATION,
  name: "Split",
  form: [
    {
      displayName: "Split schema",
      helperText: "Click on border to add point; Click on point to remove it",
      propertyName: "split",
      inputType: InputType.SPLIT,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Rotation",
      helperText: "Angle from -360 to 360",
      propertyName: "rotation",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Random intensity",
      helperText: "Random intensity; Set 0 to disable random move",
      propertyName: "randomStrength",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const splitDefaults: ISplitAnimation = {
  id: SPLIT_ANIMATION,
  hasDelay: false,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["slide"],
  canBeCombined: false,
  // animation properties
  split: {
    center: {
      x: 50,
      y: 50,
    },
    points: [
      {
        x: 0,
        y: 30.5,
      },
      {
        x: 36,
        y: 100,
      },
      {
        x: 100,
        y: 77.5,
      },
      {
        x: 83,
        y: 0,
      },
    ],
  },
  randomStrength: 0,
  rotation: 20,
};
