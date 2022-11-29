import { RGBColor } from "react-color";
import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const dev = "dev";

export interface IDevAnimation extends IAnimationBase {
  basicSubGroup?: boolean; // optional group
  /** belong to basicSubGroup */
  color1: RGBColor;
  color2: RGBColor;
  color3: RGBColor;
  color4: RGBColor;
  num5: number;
  num6: number;
  num7: number;
  num8: number;
  num9: number;
  num10: number;
  numA: number;
  numB: number;
  numC: number;
  numD: number;
  num20: number;
  num21: number;
  sg: number;
  slider: number;
  groupInTab: boolean;
  buttonGroup: string;
}
