import { IEffectBase, INextZIndex } from "../types";

export const SLIDE_SLIDE_ANIMATION = "slideSlide";

export interface ISlideSlideEffect extends IEffectBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  distance: string;
  from: "top" | "bottom" | "left" | "right";
}
