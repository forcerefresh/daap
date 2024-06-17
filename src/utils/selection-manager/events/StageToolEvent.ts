import { Point } from "../../../webslider-sdk/object/i-tool-class";
import { StageToolEnum } from "../types";

export interface StageToolEventData {
  eventType: StageToolEnum;
  objectId: string;
  originalMouseEvent: MouseEvent;
  // specific for rotation
  //   angle?: number;
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

export interface StageToolPanEventData extends StageToolEventData {
  eventType: StageToolEnum.PAN;
  x: number;
  y: number;
}

export interface StageToolSelectEventData extends StageToolEventData {
  eventType: StageToolEnum.SELECT;
  modifier: any; // TODO SHIFT
  // more props
}

export type StageToolEventDataUnion =
  | StageToolRotateEventData
  | StageToolMoveEventData
  | StageToolSelectEventData
  | StageToolPanEventData;

export class StageToolEvent<
  T = StageToolEventDataUnion
> extends CustomEvent<T> {}
