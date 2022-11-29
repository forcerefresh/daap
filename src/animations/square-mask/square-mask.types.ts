import {
  IBorderColorValue,
  INumericTimelineValue,
} from "webslider-sdk/lib/inputs/i-inputs";
import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const SQUARE_MASK_ANIMATION = "square-mask";

export interface ISquareMaskAnimation extends IAnimationBase {
  borderTop: INumericTimelineValue;
  borderBottom: INumericTimelineValue;
  borderLeft: INumericTimelineValue;
  borderRight: INumericTimelineValue;
  borderColor: IBorderColorValue;
  hideMaskOnComplete: boolean;
}
