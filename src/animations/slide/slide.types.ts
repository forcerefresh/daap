import { IAnimationBase } from "../types";

export const SLIDE_ANIMATION = "slide";

export interface ISlideAnimation extends IAnimationBase {
  distance: number;
  from: "top" | "bottom" | "left" | "right";
}
