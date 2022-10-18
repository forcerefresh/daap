import {
  INumericTimelineValue,
  ITextStartPositionValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";

export const TEXT_ANIMATION = "text-animation";

export interface TextEffectValues {
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

export interface ITextEffect extends IEffectBase, TextEffectValues {}
