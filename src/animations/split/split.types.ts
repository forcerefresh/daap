import { RGBColor } from "react-color";
import { IAnimationBase, INextZIndex } from "../types";

export const SPLIT_ANIMATION = "split";

export interface ISplitAnimation extends IAnimationBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  split: {
    center: { x: number; y: number };
    points: { x: number; y: number }[];
  };
  rotation: number;
  randomStrength: number;
}
