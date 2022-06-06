import {
  IBorderColorValue,
  INumericTimelineValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";

export const squareMask = "squareMask";

export interface ISquareMaskEffect extends IEffectBase {
  borderTop: INumericTimelineValue;
  borderBottom: INumericTimelineValue;
  borderLeft: INumericTimelineValue;
  borderRight: INumericTimelineValue;
  borderColor: IBorderColorValue;
  hideMaskOnComplete: boolean;
}
