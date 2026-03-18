import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const KEN_BURNS_ANIMATION = "ken-burns";

export interface IKenBurnsAnimation extends IAnimationBase {
  scaleFactor: number;
  transformOrigin: {
    x: number;
    y: number;
  };
}
