import { RGBColor } from "react-color";
import { IEffectBase } from "../types";

export const dev = "dev";

export interface IDevEffect extends IEffectBase {
  colors1: RGBColor[];
  slider: number;
  buttonGroup: string;
}
