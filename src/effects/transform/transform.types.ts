import { ITimelinesValue } from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";

export const TRANSFORM_EFFECT = "transform-effect";

export interface ITransformEffect extends IEffectBase {
  transform: ITimelinesValue;
}
