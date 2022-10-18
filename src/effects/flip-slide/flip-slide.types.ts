import { IEffectBase } from "../types";

export const FLIP_SLIDE_ANIMATION = "flipSlide";

export interface IFlipSlideEffect extends IEffectBase {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
}
