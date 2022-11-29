import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";
import { IParallaxInputValue } from "webslider-sdk/lib/inputs/i-inputs";

export const PARALLAX_ANIMATION = "parallax-animation";

export interface IParallaxAnimation extends IAnimationBase {
  parallax: IParallaxInputValue;
}
