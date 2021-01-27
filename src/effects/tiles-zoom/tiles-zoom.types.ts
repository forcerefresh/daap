import { IEffectBase } from "../types";

export const tilesZoom = "tilesZoom";

export interface ITilesZoomEffect extends IEffectBase {
  row: number;
  column: number;
  transformOrigin: {
    x: number;
    y: number;
  };
  pointOfView:
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
