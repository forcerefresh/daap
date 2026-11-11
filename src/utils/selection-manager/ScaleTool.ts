import { screenPointToLocal } from "../../panels/stage-panel-new/stage-panel-utils";
import { Point } from "webslider-sdk/lib/objects/i-objects-register";
import { getMousePosition } from "../doom-utils/common";
import {
  StageToolEvent,
  StageToolScaleEventData,
} from "./events/StageToolEvent";
import { IStageTool, IStageToolData, StageToolEnum } from "./types";
import { updateHandleVisibility } from "./utils";

export class ScaleTool extends EventTarget implements IStageTool {
  private initialMousePosition: Point;
  private contextMatrix: DOMMatrix;
  private objectRotation: number;
  private objectScale: number;
  private objectId: string;
  private handle: string;


  private mouseMove;
  private mouseUp;

  constructor(data: IStageToolData) {
    super();
    this.initialMousePosition = data.mousePosition;
    this.contextMatrix = data.contextMatrix;
    this.objectId = data.objectId;
    this.objectRotation = data.objectRotation;
    this.objectScale = data.objectScale;
    this.handle = data.handle;

    this.mouseMove = this.handleMouseMove.bind(this);
    this.mouseUp = this.handleMouseUp.bind(this);

    window.addEventListener("mousemove", this.mouseMove);
    window.addEventListener("mouseup", this.mouseUp);

    updateHandleVisibility("rotation-handle", false);
  }

  handleMouseMove(e: MouseEvent) {
    const mousePosition = getMousePosition(e);

    const x = mousePosition.x - this.initialMousePosition.x;
    const y = mousePosition.y - this.initialMousePosition.y;

    const realMove = screenPointToLocal(
      { x, y },
      this.contextMatrix,
      this.objectRotation,
      this.objectScale
    );

    this.dispatchEvent(
      new StageToolEvent<StageToolScaleEventData>("change", {
        detail: {
          eventType: StageToolEnum.SCALE,
          objectId: this.objectId,
          originalMouseEvent: e,
          ...realMove,
          mouseMove: {
            x,
            y,
          },
          handle: this.handle,
        },
      })
    );
  }

  handleMouseUp(e: MouseEvent) {
    const mousePosition = getMousePosition(e);

    const x = mousePosition.x - this.initialMousePosition.x;
    const y = mousePosition.y - this.initialMousePosition.y;

    const realMove = screenPointToLocal(
      { x, y },
      this.contextMatrix,
      this.objectRotation,
      this.objectScale
    );

    this.dispatchEvent(
      new StageToolEvent<StageToolScaleEventData>("stop", {
        detail: {
          eventType: StageToolEnum.SCALE,
          objectId: this.objectId,
          originalMouseEvent: e,
          ...realMove,
          mouseMove: {
            x,
            y,
          },
          handle: this.handle,
        },
      })
    );

    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("mouseup", this.mouseUp);

    updateHandleVisibility("rotation-handle", true);
  }

  stop() {}
}
