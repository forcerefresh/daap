import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const FLIP_ANIMATION = "flip";

export interface IFlipAnimation extends IAnimationBase {
  rotationTime: number;
  pauseTime: number;
  spinDirection: "cc" | "ccw";
  rotateFirstElement: boolean;
}
