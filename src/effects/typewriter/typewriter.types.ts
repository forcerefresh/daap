import { IEffectBase } from "../types";

export const typewriter = "typewriter";

export interface ITypeWriterEffect extends IEffectBase {
  typeCharacterSpeed: number;
  deleteCharacterSpeed: number;
  emptySpaceTypeTime: number;
  emptySpaceDeleteTime: number;
  cursorBlinking: number;
  initialDelay: number;
  cursorPadding: number;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
}
