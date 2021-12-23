import { IEffectBase } from "../types";

export const flipSlide = "flipSlide";

export interface IFlipSlideEffect extends IEffectBase {
  nextSlideEl?: HTMLDivElement;
  prevSlideEl?: HTMLDivElement;
  durationBetweenItems: number;
}
