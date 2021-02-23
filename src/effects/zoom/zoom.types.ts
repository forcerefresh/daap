import { IEffectBase } from "../types";

export const zoomIn = "zoomIn";

export interface IZoomInEffect extends IEffectBase {
  scaleX: number;
  scaleY: number;
}
