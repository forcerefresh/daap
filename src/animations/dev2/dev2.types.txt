import { RGBColor } from "react-color";
import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const dev2 = "dev2";

export interface IDev2Animation extends IAnimationBase {
  colors1: RGBColor[];
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  hasAdvancedOptions: boolean; // optional tab
  number5: number;
  number6: number;
}
