import { IEffectBase } from "../types";

export const tilesFade = "tilesFade";

export interface ITilesFadeEffect extends IEffectBase {
  rows: number;
  columns: number;
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
