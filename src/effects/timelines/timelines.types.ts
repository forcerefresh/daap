import { ITimelinesValue } from "../../webslider-sdk/src/inputs/i-inputs";
import { IEffectBase } from "../types";

export const timelinesEffect = "timelinesEffect";

export interface ITimelinesEffect extends IEffectBase {
  timelines: ITimelinesValue;
}
