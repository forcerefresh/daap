import { RGBColor } from "react-color";
import { IEffectBase, INextZIndex } from "../types";

export const cube = "cube";

export interface ICubeEffect extends IEffectBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  cubeBackgroundColor: RGBColor;
  cubeEdgeColor: RGBColor;
}
