import { Point } from "../../webslider-sdk/object/i-tool-class";

export enum StageToolEnum {
  ROTATE = "ROTATE",
  SCALE = "SCALE",
  MOVE = "MOVE",
  SELECT = "SELECT",
  //   RESIZE = "RESIZE",
  PAN = "PAN",
  // DESELECT = "DESELECT",
}

export interface IStageTool extends EventTarget {
  stop: () => void;
  //   onChange: (e: StageToolChangeEvent) => void;
  //   onStop: (e: StageToolChangeEvent) => void;
  //   onCancel: () => void;
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
