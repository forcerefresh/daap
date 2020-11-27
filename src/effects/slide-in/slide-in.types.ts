import { IEffectBase } from "../types";

export const slideIn = "slideIn";

export interface ISlideInEffect extends IEffectBase {
  distance: number;
  from: "top" | "bottom" | "left" | "right";
}
