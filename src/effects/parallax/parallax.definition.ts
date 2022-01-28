import { InputType, IParallaxInput } from "../../inputs/types";
import { IEffectDefinition } from "../types";
import { parallax, IParallaxEffect } from "./parallax.types";

export type IParallaxTuple = [IParallaxInput<"parallax">];

export const parallaxDefinition: IEffectDefinition<IParallaxTuple> = {
  id: parallax,
  name: "Parallax",
  form: [
    {
      displayName: "Parallax",
      propertyName: "parallax",
      inputType: InputType.PARALLAX,
      value: {} as any,
      defaultValue: {} as any,
    },
  ],
};

export const parallaxDefaults: IParallaxEffect = {
  id: parallax,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedEffectTypes: ["layer"],
  canBeCombined: false,
  // effect properties
  parallax: {
    objects: [],
    autoDepthInc: 5,
    autoDepth: true,
    smooth: true,
    strengthX: 50,
    strengthY: 50,
    setToInitialPositionOnComplete: false,
    followTime: 500,
  },
};
