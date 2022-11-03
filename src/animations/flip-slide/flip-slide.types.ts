import { IAnimationBase } from "../types";

export const FLIP_SLIDE_ANIMATION = "flipSlide";

export interface IFlipSlideAnimation extends IAnimationBase {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
}
