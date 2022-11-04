import { IImageInputValue } from "webslider-sdk2/lib/inputs/i-inputs";
import { IAnimationBase } from "../types";

export const FALLING_LEAVES_ANIMATION = "falling-leaves";

export interface IFallingLeaves extends IAnimationBase {
  number: number;
  image: IImageInputValue;
  width: number;
  height: number;
}
