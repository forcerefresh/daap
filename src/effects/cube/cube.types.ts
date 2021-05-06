import { RGBColor } from "react-color";
import { IEffectBase } from "../types";

export const cube = "cube";

export interface ICubeEffect extends IEffectBase {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  cubeBackgroundColor: RGBColor;
  cubeEdgeColor: RGBColor;
}
