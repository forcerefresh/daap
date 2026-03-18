import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const FLIP_SLIDE_ANIMATION = "flipSlide";

export interface IFlipSlideAnimation extends IAnimationBase {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
}
