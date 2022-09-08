import { IImageInputValue } from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";

export const FALLING_LEAVES_ANIMATION = "falling-leaves";

export interface IFallingLeaves extends IEffectBase {
  number: number;
  image: IImageInputValue;
  width: number;
  height: number;
}
