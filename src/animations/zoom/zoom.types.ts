import { IAnimationBase } from "../types";

export const ZOOM_ANIMATION = "zoomIn";

export interface IZoomInAnimation extends IAnimationBase {
  scaleX: number;
  scaleY: number;
}
