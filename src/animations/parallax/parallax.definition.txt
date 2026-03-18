import { InputType, IParallaxInput } from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationDefinition } from "webslider-sdk/lib/animations/i-animation-types";
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
  supportLayers: true,
  canBeCombined: false,
  library: "animejs",
  // animation properties
  parallax: {
    objects: [],
    smooth: true,
    depthType: "auto",
    autoDepthInc: 5,
    strength: 50,
    setToInitialPositionOnComplete: false,
    followTime: 500,
    trigger: "window",
    customScrollbarSelector: "",
  },
};
