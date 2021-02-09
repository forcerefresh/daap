import { IEffectBase } from "../types";

export const sliceSlideInner = "sliceSlideInner";

export interface ISliceSlideInnerEffect extends IEffectBase {
  rows: number;
  columns: number;
  filter: number;
  startFrom: "random" | "center" | "start" | "end";
  axisX: number;
  axisY: number;
}
