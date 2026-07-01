import { Point } from "../../webslider-sdk/object/i-tool-class";
import { getMousePosition } from "../doom-utils/common";
import {
  StageToolEvent,
  StageToolPointsRepositionEventData,
} from "./events/StageToolEvent";
import { IStageTool, IStageToolData, StageToolEnum } from "./types";

export class PointsRepositionTool extends EventTarget implements IStageTool {
  private initialMousePosition: Point;
  private contextMatrix: DOMMatrix;
  private objectRotation: number;
  private objectScale: number;
  private objectId: string;
  private handle: "point0" | "point1";

  private mouseMove: (e: MouseEvent) => void;
  private mouseUp: (e: MouseEvent) => void;

  constructor(data: IStageToolData) {
    super();
    this.initialMousePosition = data.mousePosition;
    this.contextMatrix = data.contextMatrix;
    this.objectId = data.objectId;
    this.objectRotation = data.objectRotation;
    this.objectScale = data.objectScale;
    this.handle = data.handle as "point0" | "point1";

    this.mouseMove = this.handleMouseMove.bind(this);
    this.mouseUp = this.handleMouseUp.bind(this);

    window.addEventListener("mousemove", this.mouseMove);
    window.addEventListener("mouseup", this.mouseUp);
  }

  private rawDelta(e: MouseEvent): Point {
    const mousePosition = getMousePosition(e);
    return {
      x: mousePosition.x - this.initialMousePosition.x,
      y: mousePosition.y - this.initialMousePosition.y,
    };
  }

  handleMouseMove(e: MouseEvent) {
    const delta = this.rawDelta(e);
    this.dispatchEvent(
      new StageToolEvent<StageToolPointsRepositionEventData>("change", {
        detail: {
          eventType: StageToolEnum.POINTS_REPOSITION,
          objectId: this.objectId,
          originalMouseEvent: e,
          mouseMove: delta,
          contextMatrix: this.contextMatrix,
          objectRotation: this.objectRotation,
          objectScale: this.objectScale,
          handle: this.handle,
        },
      }),
    );
  }

  handleMouseUp(e: MouseEvent) {
    const delta = this.rawDelta(e);
    this.dispatchEvent(
      new StageToolEvent<StageToolPointsRepositionEventData>("stop", {
        detail: {
          eventType: StageToolEnum.POINTS_REPOSITION,
          objectId: this.objectId,
          originalMouseEvent: e,
          mouseMove: delta,
          contextMatrix: this.contextMatrix,
          objectRotation: this.objectRotation,
          objectScale: this.objectScale,
          handle: this.handle,
        },
      }),
    );

    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("mouseup", this.mouseUp);
  }

  stop() {}
}
