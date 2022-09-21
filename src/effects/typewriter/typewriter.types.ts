import { IEffectBase } from "../types";

export const TYPEWRITER_ANIMATION = "typewriter";

export interface ITypeWriterEffect extends IEffectBase {
  typeCharacterSpeed: number;
  deleteCharacterSpeed: number;
  emptySpaceTypeTime: number;
  emptySpaceDeleteTime: number;
  cursorBlinking: number;
  initialDelay: number;
  timeAfterWrite: number;
  cursorPadding: number;
  hasDelete?: boolean;
}
