import { getAbsEl } from "../../panels/stage-panel-new/WithRotationHandle";
import { screenPointToLocal } from "../../panels/stage-panel-new/stage-panel-utils";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import { getMousePosition } from "../doom-utils/common";
import {
  StageToolEvent,
  StageToolMoveEventData,
} from "./events/StageToolEvent";
import { IStageTool, IStageToolData, StageToolEnum } from "./types";

export class MoveTool extends EventTarget implements IStageTool {
  private initialMousePosition: Point;
  private contextMatrix: DOMMatrix;
  private objectRotation: number;
  private objectScale: number;
  private objectId: string;
  private boundingClientRects: DOMRect[];
  //   private center: Point;
  //   private startAngle: number = 0;

  private mouseMove;
  private mouseUp;

  constructor(data: IStageToolData) {
    super();
    this.initialMousePosition = data.mousePosition;
    this.contextMatrix = data.contextMatrix;
    this.objectId = data.objectId;
    this.boundingClientRects = data.boundingClientRects;
    this.objectRotation = data.objectRotation;
    this.objectScale = data.objectScale;

    this.mouseMove = this.handleMouseMove.bind(this);
    this.mouseUp = this.handleMouseUp.bind(this);

    // NOTE: currently supported only one object
    //const rect = this.boundingClientRects[0];
    // this.center = {
    //   x: rect.left + rect.width / 2,
    //   y: rect.top + rect.height / 2,
    // };

    //this.startAngle = this.getAngle(this.initialMousePosition);

    (window as any).addEventListener("mousemove", this.mouseMove);
    (window as any).addEventListener("mouseup", this.mouseUp);
  }

  handleMouseMove(e: MouseEvent) {
    const mousePosition = getMousePosition(e);
    //const angle = this.getAngle(mousePosition);

    const x = mousePosition.x - this.initialMousePosition.x;
    const y = mousePosition.y - this.initialMousePosition.y;

    const realMove = screenPointToLocal(
      { x, y },
      this.contextMatrix,
      this.objectRotation,
      this.objectScale
    );

    this.dispatchEvent(
      new StageToolEvent<StageToolMoveEventData>("change", {
        detail: {
          eventType: StageToolEnum.MOVE,
          objectId: this.objectId,
          originalMouseEvent: e,
          ...realMove,
          mouseMove: {
            x,
            y,
          },
        },
      })
    );
  }

  handleMouseUp(e: MouseEvent) {
    const mousePosition = getMousePosition(e);
    //const angle = this.getAngle(mousePosition);

    const x = mousePosition.x - this.initialMousePosition.x;
    const y = mousePosition.y - this.initialMousePosition.y;

    const realMove = screenPointToLocal(
      { x, y },
      this.contextMatrix,
      this.objectRotation,
      this.objectScale
    );

    this.dispatchEvent(
      new StageToolEvent<StageToolMoveEventData>("stop", {
        detail: {
          eventType: StageToolEnum.MOVE,
          objectId: this.objectId,
          originalMouseEvent: e,
          ...realMove,
          mouseMove: {
            x,
            y,
          },
        },
      })
    );

    (window as any).removeEventListener("mousemove", this.mouseMove);
    (window as any).removeEventListener("mouseup", this.mouseUp);
  }

  stop() {}
}
