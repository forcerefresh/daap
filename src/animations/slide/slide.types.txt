import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const SLIDE_ANIMATION = "slide";

export interface ISlideAnimation extends IAnimationBase {
  distance: number;
  from: "top" | "bottom" | "left" | "right";
}
