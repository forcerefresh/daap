import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const ZOOM_ANIMATION = "zoomIn";

export interface IZoomInAnimation extends IAnimationBase {
  scaleX: number;
  scaleY: number;
}
