import { IEffectBase } from "../types";

export const parallax = "parallax";

export interface IParallaxEffect extends IEffectBase {
  parallax: {
    objects: { id: string; depth: number }[];
    smooth: boolean;
    autoDepth: boolean;
    autoDepthInc: number;
  };
}
