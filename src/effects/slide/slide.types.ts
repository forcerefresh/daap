import { IEffectBase } from "../types";

export const slide = "slide";

export interface ISlideEffect extends IEffectBase {
  distance: number;
  from: "top" | "bottom" | "left" | "right";
}
