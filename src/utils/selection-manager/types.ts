import { Point } from "webslider-sdk/lib/objects/i-objects-register";

export enum StageToolEnum {
  ROTATE = "ROTATE",
  SCALE = "SCALE",
  MOVE = "MOVE",
  SELECT = "SELECT",
  PAN = "PAN",
  POINTS_REPOSITION = "POINTS_REPOSITION",
}

export interface IStageTool extends EventTarget {
  stop: () => void;
}

export interface IStageToolData {
  mousePosition: Point;
  contextMatrix: DOMMatrix;
  objectRotation: number;
  objectScale: number;
  objectId: string;
  boundingClientRects: DOMRect[];
  handle: string;
  isLocked?: boolean;
}
