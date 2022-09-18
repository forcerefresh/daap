import { IEffectBase } from "../types";

export const FLIP_ANIMATION = "flip";

export interface IFlipEffect extends IEffectBase {
  rotationTime: number;
  pauseTime: number;
  spinDirection: "cc" | "ccw";
}
