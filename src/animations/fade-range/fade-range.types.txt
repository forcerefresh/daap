import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const FADE_RANGE_ANIMATION = "fade-range";

export interface IFadeRangeAnimation extends IAnimationBase {
  from: number;
  to: number;
}
