import { getAbsEl } from "../../panels/stage-panel-new/WithRotationHandle";
import { screenPointToLocal } from "../../panels/stage-panel-new/stage-panel-utils";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import { getMousePosition } from "../doom-utils/common";
import {
  StageToolEvent,
  StageToolMoveEventData,
  StageToolScaleEventData,
} from "./events/StageToolEvent";
import { IStageTool, IStageToolData, StageToolEnum } from "./types";
import { updateBoxShadow, updateHandleVisibility } from "./utils";

export class ScaleTool extends EventTarget implements IStageTool {
  private initialMousePosition: Point;
  private contextMatrix: DOMMatrix;
  private objectRotation: number;
  private objectScale: number;
  private objectId: string;
  private handle: string;

  private prevBoxShadow: string | undefined;

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
    this.handle = data.handle;

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

    updateHandleVisibility("rotation-handle", false);
    // TODO this.prevBoxShadow = updateBoxShadow(this.objectId, "none");
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

    (window as any).removeEventListener("mousemove", this.mouseMove);
    (window as any).removeEventListener("mouseup", this.mouseUp);

    updateHandleVisibility("rotation-handle", true);
    // updateBoxShadow(this.objectId, this.prevBoxShadow);
  }

  stop() {}
}
