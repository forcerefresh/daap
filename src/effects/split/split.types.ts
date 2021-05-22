import { RGBColor } from "react-color";
import { IEffectBase, INextZIndex } from "../types";

export const split = "split";

export interface ISplitEffect extends IEffectBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  split: {
    center: { x: number; y: number };
    points: { x: number; y: number }[];
  };
  rotation: number;
  randomStrength: number;
}
