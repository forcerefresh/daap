import { IAnimationBase } from "webslider-sdk/lib/animations/i-animation-types";

export const TYPEWRITER_ANIMATION = "typewriter";

export interface ITypeWriterAnimation extends IAnimationBase {
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
