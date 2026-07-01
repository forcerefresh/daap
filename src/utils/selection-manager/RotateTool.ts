import { Point } from "../../webslider-sdk/object/i-tool-class";
import { getMousePosition } from "../doom-utils/common";
import {
  StageToolEvent,
  StageToolMoveEventData,
  StageToolRotateEventData,
} from "./events/StageToolEvent";
import { IStageTool, IStageToolData, StageToolEnum } from "./types";
import { updateBoxShadow, updateHandleVisibility } from "./utils";

export class RotateTool extends EventTarget implements IStageTool {
  private initialMousePosition: Point;
  private contextMatrix: DOMMatrix;
  private objectId: string;
  private boundingClientRects: DOMRect[];
  private center: Point;
  private startAngle: number = 0;

  private mouseMove;
  private mouseUp;

  private prevBoxShadow: string | undefined;

  constructor(data: IStageToolData) {
    super();
    this.initialMousePosition = data.mousePosition;
    this.contextMatrix = data.contextMatrix;
    this.objectId = data.objectId;
    this.boundingClientRects = data.boundingClientRects;

    this.mouseMove = this.handleMouseMove.bind(this);
    this.mouseUp = this.handleMouseUp.bind(this);

    // NOTE: currently supported only one object
    const rect = this.boundingClientRects[0];
    this.center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    this.startAngle = this.getAngle(this.initialMousePosition);

    window.addEventListener("mousemove", this.mouseMove);
    window.addEventListener("mouseup", this.mouseUp, true);

    updateHandleVisibility("resize-handle", false);
    this.prevBoxShadow = updateBoxShadow(this.objectId, "none");
  }

  handleMouseMove(e: MouseEvent) {
    e.stopPropagation();

    const mousePosition = getMousePosition(e);
    const angle = this.getAngle(mousePosition);

    this.dispatchEvent(
      new StageToolEvent<StageToolRotateEventData>("change", {
        detail: {
          eventType: StageToolEnum.ROTATE,
          angle,
          objectId: this.objectId,
          originalMouseEvent: e,
        },
      })
    );
  }

  handleMouseUp(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    const mousePosition = getMousePosition(e);
    const angle = this.getAngle(mousePosition);

    this.dispatchEvent(
      new StageToolEvent<StageToolRotateEventData>("stop", {
        detail: {
          eventType: StageToolEnum.ROTATE,
          angle,
          objectId: this.objectId,
          originalMouseEvent: e,
        },
      })
    );

    // reset
    this.startAngle = 0;
    this.center = { x: 0, y: 0 };

    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("mouseup", this.mouseUp, true);

    updateHandleVisibility("resize-handle", true);
    updateBoxShadow(this.objectId, this.prevBoxShadow);
  }

  stop() {}

  getAngle(p: Point) {
    var angleRad = Math.atan2(this.center.y - p.y, this.center.x - p.x);

    const angle = (angleRad * 180) / Math.PI;

    return angle - this.startAngle;
  }
}
