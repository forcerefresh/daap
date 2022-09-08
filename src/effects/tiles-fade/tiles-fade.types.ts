import { IEffectBase } from "../types";

export const TILES_FADE_ANIMATION = "tiles-fade";

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
