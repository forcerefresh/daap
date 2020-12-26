import { IEffectBase } from "../types";

export const kenBurns = "kenBurns";

export interface IKenBurnsEffect extends IEffectBase {
  scaleFactor: number;
  transformOrigin: {
    x: number;
    y: number;
  };
}
