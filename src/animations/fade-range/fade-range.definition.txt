import { InputType } from "webslider-sdk/lib/inputs/i-inputs";
import { FADE_RANGE_ANIMATION, IFadeRangeAnimation } from "./fade-range.types";

export const fadeRangeDefinition = {
  id: FADE_RANGE_ANIMATION,
  name: "Fade range",
  form: [
    {
      displayName: "From",
      helperText: "",
      propertyName: "from",
      inputType: InputType.SLIDER_INPUT,
      inputProps: {
        min: 0,
        max: 100,
        suffix: "",
        stepSize: 1,
        labelStepSize: 1,
        trackFill: false,
        thumbPosition: "top",
        hideLabels: false,
      },
    },
    {
      displayName: "To",
      helperText: "",
      propertyName: "to",
      inputType: InputType.SLIDER_INPUT,
      inputProps: {
        min: 0,
        max: 100,
        suffix: "",
        stepSize: 1,
        labelStepSize: 1,
        trackFill: false,
        thumbPosition: "top",
        hideLabels: false,
      },
    },
  ],
};

export const fadeRangeDefaults: IFadeRangeAnimation = {
  id: FADE_RANGE_ANIMATION,
  hasDelay: true,
  hasDuration: true,
  hasEase: true,
  hasChildEase: false,
  ease: "none",
  supportedAnimationTypes: ["in", "out", "event"],
  supportLayers: true,
  canBeCombined: true,
  outStartTime: {
    customValue: "0ms",
    inheritFrom: "inheritFromSlide",
  },
  // this animation has no configuration
  from: 0,
  to: 100,
};
