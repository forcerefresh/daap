import { IAnimationBase } from "../types";

export const PARALLAX_ANIMATION = "parallax";

export interface IParallaxAnimation extends IAnimationBase {
  parallax: {
    objects: { id: string; depth: number }[];
    smooth: boolean;
    autoDepth: boolean;
    autoDepthInc: number;
    strengthX: number;
    strengthY: number;
    setToInitialPositionOnComplete: boolean;
    followTime: number;
  };
}
