import {
  IAnimationBase,
  INextZIndex,
} from "webslider-sdk/lib/animations/i-animation-types";

export const FADE_SLIDE_ANIMATION = "fadeSlide";

export interface IFadeSlideAnimation extends IAnimationBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
}
