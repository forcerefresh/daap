import { IEffectBase } from "../types";
export const fallingLeaves = "fallingLeaves";

export interface IFallingLeaves extends IEffectBase {
  number: number;
  image: {
    url: string;
    width: number;
    height: number;
    isPlaceholder?: boolean;
  };
  width: number;
  height: number;
}
