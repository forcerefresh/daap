import { IEffectBase, INextZIndex } from "../types";

export const SLIDE_SLIDE_ANIMATION = "slideSlide";

export interface ISlideSlideEffect extends IEffectBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  distance: number;
  from: "top" | "bottom" | "left" | "right";
}
