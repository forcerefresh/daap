import { IEffectBase } from "../types";

export const splitText = "splitText";

export interface ISplitTextEffect extends IEffectBase {
  durationPerChar: number;
  delayBetweenChar: number;
  scaleX: number;
  scaleY: number;
  rotationPerChar: number;
  positionX: number;
  positionY: number;
  startFrom: 
  | "random"
  | "center"
  | "edges"
  | "end"
  | 0
}
