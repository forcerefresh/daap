import { IEffectBase } from "../types";

export const squareMask = "squareMask";

export interface ISquareMaskEffect extends IEffectBase {
  borderTop: number;
  borderBottom: number;
  borderLeft: number;
  borderRight: number;
}
