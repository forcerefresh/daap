import { RGBColor } from "react-color";
import { IEffectBase } from "../types";

export const TRIANGLIFY_ANIMATION = "trianglifyPhoto";

export interface ITrianglifyEffect extends IEffectBase {
  colorsSG: "match" | "both" | "random";
  colors: RGBColor[]; // form "match"
  colorsX: RGBColor[]; // for "both"
  colorsY: RGBColor[]; // for "both"
  cellSize: number;
  variance: number;
  seed: string;
  fill: boolean;
  strokeWidth: number;
  strokeColorSG: "none" | "color";
  strokeColor: RGBColor;
}
