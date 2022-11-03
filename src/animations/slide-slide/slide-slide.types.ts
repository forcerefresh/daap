import { IAnimationBase, INextZIndex } from "../types";

export const SLIDE_SLIDE_ANIMATION = "slideSlide";

export interface ISlideSlideAnimation extends IAnimationBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  distance: string;
  from: "top" | "bottom" | "left" | "right";
}
