import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";
import { ITimelinesValue } from "webslider-sdk/lib/inputs/i-inputs";

export const TRANSFORM_ANIMATION = "transform-animation";

export interface ITransformAnimation extends IAnimationBase {
  transform: ITimelinesValue;
}
