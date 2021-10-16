import { RGBColor } from "react-color";
import { IEffectBase } from "../types";

export const trianglifyPhoto = "trianglifyPhoto";

export interface ITrianglifyEffect extends IEffectBase {
  colors: RGBColor[];
  cellSize: number;
  variance: number;
  seed: string;
  fill: boolean;
  strokeWidth: number;
}
