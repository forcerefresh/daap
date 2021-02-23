import { IEffectBase } from "../types";

export const tilesSlideInner = "tilesSlideInner";

export interface ITilesSlideInnerEffect extends IEffectBase {
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
