import { IEffectBase } from "../types";

export const KEN_BURNS_ANIMATION = "ken-burns";

export interface IKenBurnsEffect extends IEffectBase {
  scaleFactor: number;
  transformOrigin: {
    x: number;
    y: number;
  };
}
