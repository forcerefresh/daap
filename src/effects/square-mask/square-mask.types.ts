import { RGBColor } from "react-color";
import { INumericTimelineValue } from "../../inputs/types";
import { IEffectBase } from "../types";

export const squareMask = "squareMask";

export interface ISquareMaskEffect extends IEffectBase {
  borderTop: INumericTimelineValue;
  borderBottom: INumericTimelineValue;
  borderLeft: INumericTimelineValue;
  borderRight: INumericTimelineValue;
  borderColor: RGBColor;
  hideMaskOnComplete: boolean;
}
