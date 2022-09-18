import { IEffectBase } from "../types";

export const PARALLAX_ANIMATION = "parallax";

export interface IParallaxEffect extends IEffectBase {
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
