import { ITimelinesValue } from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";

export const TIMELINES_EFFECT = "timelines-effect";

export interface ITimelinesEffect extends IEffectBase {
  timelines: ITimelinesValue;
}
