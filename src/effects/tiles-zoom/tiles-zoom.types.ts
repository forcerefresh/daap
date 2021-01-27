import { IEffectBase } from "../types";

export const tilesZoom = "tilesZoom";

export interface ITilesZoomEffect extends IEffectBase {
  rows: number;
  columns: number;
  transformOrigin: {
    x: number;
    y: number;
  };
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
