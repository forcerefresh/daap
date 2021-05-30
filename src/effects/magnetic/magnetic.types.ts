import { IEffectBase } from "../types";

export const magnetic = "magnetic";

export interface IMagneticEffect extends IEffectBase {
  strengthX: number;
  strengthY: number;
  setToInitialPositionOnComplete: boolean;
  followTime: number;
}
