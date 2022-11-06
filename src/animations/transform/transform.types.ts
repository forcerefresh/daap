import { ITimelinesValue } from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationBase } from "../types";

export const TRANSFORM_ANIMATION = "transform-animation";

export interface ITransformAnimation extends IAnimationBase {
  transform: ITimelinesValue;
}
