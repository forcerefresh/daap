import { IImageInputValue } from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";
export const fallingLeaves = "fallingLeaves";

export interface IFallingLeaves extends IEffectBase {
  number: number;
  image: IImageInputValue;
  width: number;
  height: number;
}
