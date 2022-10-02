import { IEffectBase, INextZIndex } from "../types";

export const FADE_SLIDE_ANIMATION = "fadeSlide";

export interface IFadeSlideEffect extends IEffectBase, INextZIndex {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
}
