import { IAnimationBase } from "../types";

export const SLICE_SLIDE_ANIMATION = "sliceSlide";

export interface ISliceSlideAnimation extends IAnimationBase {
  slices: number;
  orientation: "horizontal" | "vertical";
  startingPoint: "random" | "center" | "start" | "end";
  distance: number;
  from: "top" | "bottom" | "left" | "right";
}
