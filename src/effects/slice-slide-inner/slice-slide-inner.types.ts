import { IEffectBase } from "../types";

export const sliceSlideInner = "sliceSlideInner";

export interface ISliceSlideInnerEffect extends IEffectBase {
  rows: number;
  columns: number;
  blur: number;
  opacity: number;
  axisX: number;
  axisY: number;
  startFrom:
    | "random"
    | "center"
    | "horizontal-center"
    | "vertical-center"
    | "edges"
    | "horizontal-edges"
    | "vertical-edges"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
}
