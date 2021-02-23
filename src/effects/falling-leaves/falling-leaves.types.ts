import { IEffectBase } from "../types";
export const fallingLeaves = "fallingLeaves";

export interface IFallingLeaves extends IEffectBase {
	fromOpacity: number;
  toOpacity: number;
}
