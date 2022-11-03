import {
  InputType,
  IParallaxInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectDefinition } from "../types";
import { IParallaxEffect, PARALLAX_ANIMATION } from "./parallax.types";

export type IParallaxTuple = [IParallaxInput<"parallax">];

export const parallaxDefinition: IEffectDefinition<IParallaxTuple> = {
  id: PARALLAX_ANIMATION,
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
  id: PARALLAX_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["layer"],
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
