import {
  INumericTimelineValue,
  ITextStartPositionValue,
} from "../../inputs/types";
import { IEffectBase } from "../types";

export const splitText = "splitText";

export interface ISplitTextEffect extends IEffectBase {
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
