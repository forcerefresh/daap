import {
  INumericTimelineValue,
  ITextStartPositionValue,
} from "webslider-sdk2/lib/inputs/i-inputs";
import { IAnimationBase } from "../types";

export const TEXT_ANIMATION = "text-animation";

export interface TextAnimationValues {
  durationPerChar: number;
  delayBetweenChar: number;
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
