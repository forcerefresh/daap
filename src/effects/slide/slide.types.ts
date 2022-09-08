import { IEffectBase } from "../types";

export const SLIDE_ANIMATION = "slide";

export interface ISlideEffect extends IEffectBase {
  distance: number;
  from: "top" | "bottom" | "left" | "right";
}
