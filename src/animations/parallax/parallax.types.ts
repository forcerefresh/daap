import { IParallaxInputValue } from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationBase } from "../types";

export const PARALLAX_ANIMATION = "parallax-animation";

export interface IParallaxAnimation extends IAnimationBase {
  parallax: IParallaxInputValue;
}
