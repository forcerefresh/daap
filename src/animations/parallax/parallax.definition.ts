import {
  InputType,
  IParallaxInput,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IAnimationDefinition } from "../types";
import { IParallaxAnimation, PARALLAX_ANIMATION } from "./parallax.types";

export type IParallaxTuple = [IParallaxInput<"parallax">];

export const parallaxDefinition: IAnimationDefinition<IParallaxTuple> = {
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

export const parallaxDefaults: IParallaxAnimation = {
  id: PARALLAX_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["layer"],
  canBeCombined: false,
  // animation properties
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
