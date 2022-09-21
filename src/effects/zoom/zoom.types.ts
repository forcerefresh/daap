import { IEffectBase } from "../types";

export const ZOOM_ANIMATION = "zoomIn";

export interface IZoomInEffect extends IEffectBase {
  scaleX: number;
  scaleY: number;
}
