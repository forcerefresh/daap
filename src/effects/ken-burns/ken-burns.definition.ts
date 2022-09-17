import {
  InputType,
  INumberInput,
  ITransformOriginInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { IKenBurnsEffect, KEN_BURNS_EFFECT } from "./ken-burns.types";

export type IKenBurnsTuple = [
  INumberInput<"scaleFactor">,
  ITransformOriginInput<"transformOrigin">
];

export const kenBurnsDefinition: IEffectDefinition<IKenBurnsTuple> = {
  id: KEN_BURNS_EFFECT,
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

export const kenBurnsDefaults: IKenBurnsEffect = {
  id: KEN_BURNS_EFFECT,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["in", "out"],
  canBeCombined: false,
  // specific to this effect
  scaleFactor: 10,
  transformOrigin: { x: 50, y: 50 },
};
