import {
  IBorderColorValue,
  INumericTimelineValue,
} from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";

export const SQUARE_MASK_ANIMATION = "square-mask";

export interface ISquareMaskEffect extends IEffectBase {
  borderTop: INumericTimelineValue;
  borderBottom: INumericTimelineValue;
  borderLeft: INumericTimelineValue;
  borderRight: INumericTimelineValue;
  borderColor: IBorderColorValue;
  hideMaskOnComplete: boolean;
}
