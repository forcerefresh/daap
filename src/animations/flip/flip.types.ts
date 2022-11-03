import { IAnimationBase } from "../types";

export const FLIP_ANIMATION = "flip";

export interface IFlipAnimation extends IAnimationBase {
  rotationTime: number;
  pauseTime: number;
  spinDirection: "cc" | "ccw";
}
