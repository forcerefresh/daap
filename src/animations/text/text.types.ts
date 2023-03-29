import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";
import {
  INumericTimelineValue,
  ITextStartPositionValue,
} from "webslider-sdk/lib/inputs/i-inputs";

export const TEXT_ANIMATION = "text-animation";

export interface TextAnimationValues {
  durationPerChar: string;
  delayBetweenChar: string;
  opacity: INumericTimelineValue;
  blur: INumericTimelineValue;
  scaleX: INumericTimelineValue;
  scaleY: INumericTimelineValue;
  rotationPerChar: INumericTimelineValue;
  positionX: INumericTimelineValue;
  positionY: INumericTimelineValue;
  startFrom: ITextStartPositionValue;
}

export interface ITextAnimation extends IAnimationBase, TextAnimationValues {}
