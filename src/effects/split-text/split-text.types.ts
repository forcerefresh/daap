import {
  INumericTimelineValue,
  ITextStartPositionValue,
} from "../../inputs/types";
import { IEffectBase } from "../types";

export const splitText = "splitText";

export interface SplitTextEffectValues {
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

export interface ISplitTextEffect extends IEffectBase, SplitTextEffectValues {}
