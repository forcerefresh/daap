import { ICSSTimelinesValue } from "../../inputs/types";
import { IEffectBase } from "../types";

export const cssEffect = "cssEffect";

export interface ICSSPointsEffect extends IEffectBase {
  cssPointsValue: ICSSTimelinesValue;
}
