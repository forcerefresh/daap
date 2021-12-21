import { IEffectBase } from "../types";

export const flip = "flip";

export interface IFlipEffect extends IEffectBase {
  durationPerItem: number;
  durationBetweenItems: number;
  spinDirection: "cc" | "ccw";
}
