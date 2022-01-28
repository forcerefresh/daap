import { ICheckboxInput, InputType, INumberInput } from "../../inputs/types";
import { IEffectDefinition } from "../types";
import { magnetic, IMagneticEffect } from "./magnetic.types";

export type IMagneticTuple = [
  INumberInput<"strengthX">,
  INumberInput<"strengthY">,
  ICheckboxInput<"setToInitialPositionOnComplete">,
  INumberInput<"followTime">
];

export const magneticDefinition: IEffectDefinition<IMagneticTuple> = {
  id: magnetic,
  name: "Magnetic",
  form: [
    {
      displayName: "Strength X",
      helperText: "Set strength for horizontal movement",
      propertyName: "strengthX",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Strength Y",
      helperText: "Set strength for vertical movement",
      propertyName: "strengthY",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Reset on complete",
      helperText: "Position object to initial position on complete",
      propertyName: "setToInitialPositionOnComplete",
      inputType: InputType.CHECKBOX,
      value: {} as any,
      defaultValue: {} as any,
    },
    {
      displayName: "Follow time",
      helperText: "Time after objects stops move",
      propertyName: "followTime",
      inputType: InputType.NUMBER,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const magneticDefaults: IMagneticEffect = {
  id: magnetic,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "back.in(2)",
  supportedEffectTypes: ["effect"],
  canBeCombined: false,
  //effect properties
  followTime: 400,
  setToInitialPositionOnComplete: true,
  strengthX: 10,
  strengthY: 10,
};
