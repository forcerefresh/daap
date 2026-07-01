import { screenPointToLocal } from "../../panels/stage-panel-new/stage-panel-utils";
import { Point } from "../../webslider-sdk/object/i-tool-class";
import { getMousePosition } from "../doom-utils/common";
import {
  StageToolEvent,
  StageToolMoveEventData,
  StageToolPanEventData,
} from "./events/StageToolEvent";
import { IStageTool, IStageToolData, StageToolEnum } from "./types";

export class PanTool extends EventTarget implements IStageTool {
  private initialMousePosition: Point;
  private mouseMove;
  private mouseUp;

  constructor(data: IStageToolData) {
    super();
    this.initialMousePosition = data.mousePosition;

    this.mouseMove = this.handleMouseMove.bind(this);
    this.mouseUp = this.handleMouseUp.bind(this);

    window.addEventListener("mousemove", this.mouseMove);
    window.addEventListener("mouseup", this.mouseUp);
  }

  handleMouseMove(e: MouseEvent) {
    const mousePosition = getMousePosition(e);

    const x = mousePosition.x - this.initialMousePosition.x;
    const y = mousePosition.y - this.initialMousePosition.y;

    this.dispatchEvent(
      new StageToolEvent<StageToolPanEventData>("change", {
        detail: {
          eventType: StageToolEnum.PAN,
          objectId: "",
          originalMouseEvent: e,
          x,
          y,
        },
      })
    );
  }

  handleMouseUp(e: MouseEvent) {
    const mousePosition = getMousePosition(e);

    const x = mousePosition.x - this.initialMousePosition.x;
    const y = mousePosition.y - this.initialMousePosition.y;

    this.dispatchEvent(
      new StageToolEvent<StageToolPanEventData>("stop", {
        detail: {
          eventType: StageToolEnum.PAN,
          objectId: "",
          originalMouseEvent: e,
          x,
          y,
        },
      })
    );

    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("mouseup", this.mouseUp);
  }

  stop() {}
}
