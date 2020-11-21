import { IEffectBase } from "../types";

export const fadeIn = "fadeIn";

export interface IFadeInEffect extends IEffectBase {
  fromOpacity: number;
  toOpacity: number;
}
