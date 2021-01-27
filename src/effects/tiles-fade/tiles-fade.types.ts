import { IEffectBase } from "../types";

export const tilesFade = "tilesFade";

export interface ITilesFadeEffect extends IEffectBase {
  row: number;
  column: number;
  transformOrigin: {
    x: number;
    y: number;
  };
  pointOfView:
    | "random"
    | "center"
    | "horizontal-center"
    | "vertical-center"
    | "edges"
    | "end";
}
