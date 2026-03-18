import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const TILES_ZOOM_ANIMATION = "tilesZoom";

export interface ITilesZoomAnimation extends IAnimationBase {
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
