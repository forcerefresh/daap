import { RGBColor } from "react-color";
import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const TRIANGLIFY_ANIMATION = "trianglify-animation";

export interface ITrianglifyAnimation extends IAnimationBase {
  colorsSG: "match" | "both" | "random";
  colors: RGBColor[]; // for "match"
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
