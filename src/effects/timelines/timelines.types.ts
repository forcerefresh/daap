import { ITimelinesValue } from "../../inputs/types";
import { IEffectBase } from "../types";

export const timelinesEffect = "timelinesEffect";

export interface ITimelinesEffect extends IEffectBase {
  timelines: ITimelinesValue;
}
