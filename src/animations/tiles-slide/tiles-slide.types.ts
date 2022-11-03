import { IAnimationBase } from "../types";

export const TILES_SLIDE_ANIMATION = "tiles-slide";

export interface ITilesSlideAnimation extends IAnimationBase {
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
