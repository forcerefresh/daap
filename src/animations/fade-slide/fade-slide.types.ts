import { IAnimationBase, INextZIndex } from "../types";

export const FADE_SLIDE_ANIMATION = "fadeSlide";

export interface IFadeSlideAnimation extends IAnimationBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
}
