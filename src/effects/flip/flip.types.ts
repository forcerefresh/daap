import { IEffectBase } from "../types";

export const flip = "flip";

export interface IFlipEffect extends IEffectBase {
  rotationTime: number;
  pauseTime: number;
  spinDirection: "cc" | "ccw";
}
