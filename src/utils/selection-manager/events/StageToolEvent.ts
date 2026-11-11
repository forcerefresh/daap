import { Point } from "webslider-sdk/lib/objects/i-objects-register";
import { StageToolEnum } from "../types";

export interface StageToolEventData {
  eventType: StageToolEnum;
  objectId: string;
  originalMouseEvent: MouseEvent;
}

export interface StageToolRotateEventData extends StageToolEventData {
  eventType: StageToolEnum.ROTATE;
  angle: number;
}

export interface StageToolMoveEventData extends StageToolEventData {
  eventType: StageToolEnum.MOVE;
  x: number;
  y: number;
  mouseMove: Point;
}

export interface StageToolScaleEventData extends StageToolEventData {
  eventType: StageToolEnum.SCALE;
  x: number;
  y: number;
  mouseMove: Point;
  handle: string;
}

export interface StageToolPanEventData extends StageToolEventData {
  eventType: StageToolEnum.PAN;
  x: number;
  y: number;
}

export interface StageToolSelectEventData extends StageToolEventData {
  eventType: StageToolEnum.SELECT;
  modifier: any; // TODO SHIFT
}

export interface StageToolPointsRepositionEventData extends StageToolEventData {
  eventType: StageToolEnum.POINTS_REPOSITION;
  mouseMove: Point;
  contextMatrix: DOMMatrix;
  objectRotation: number;
  objectScale: number;
  handle: "point0" | "point1";
}

export type StageToolEventDataUnion =
  | StageToolRotateEventData
  | StageToolMoveEventData
  | StageToolSelectEventData
  | StageToolPanEventData
  | StageToolScaleEventData
  | StageToolPointsRepositionEventData;

export class StageToolEvent<
  T = StageToolEventDataUnion
> extends CustomEvent<T> {}
