import { MoveTool } from "./MoveTool";
import { PanTool } from "./PanTool";
import { PointsRepositionTool } from "./PointsRepositionTool";
import { RotateTool } from "./RotateTool";
import { ScaleTool } from "./ScaleTool";
import { StageToolEvent } from "./events/StageToolEvent";
import { IStageTool, IStageToolData, StageToolEnum } from "./types";
import EventTarget from "@ungap/event-target";

export class StageManager extends EventTarget {
  private currentTool: IStageTool | undefined;
  private changeHandlerBind: (e: StageToolEvent) => void;
  private stopHandlerBind: (e: StageToolEvent) => void;
  private cancelHandlerBind: (e: StageToolEvent) => void;

  constructor() {
    super();
    this.changeHandlerBind = this.changeHandler.bind(this);
    this.stopHandlerBind = this.stopHandler.bind(this);
    this.cancelHandlerBind = this.cancelHandler.bind(this);
  }

  start(
    stageTool: StageToolEnum,
    data: IStageToolData & { originalMouseEvent: MouseEvent }
  ) {
    this.currentTool = createStageTool(stageTool, data);
    this.currentTool.addEventListener("change", this.changeHandlerBind as any);
    this.currentTool.addEventListener("stop", this.stopHandlerBind as any);
    this.currentTool.addEventListener("cancel", this.cancelHandlerBind as any);

    // TODO: do we need to provide some data?
    this.dispatchEvent(
      new StageToolEvent("start", {
        detail: {
          eventType: stageTool,
          objectId: data.objectId,
          originalMouseEvent: data.originalMouseEvent,
          handle: data.handle,
          isLocked: data.isLocked,
        },
      })
    );
  }

  stop(internalCall = false) {
    this.currentTool?.removeEventListener(
      "change",
      this.changeHandlerBind as any
    );
    this.currentTool?.removeEventListener("stop", this.stopHandlerBind as any);
    this.currentTool?.removeEventListener(
      "cancel",
      this.cancelHandlerBind as any
    );

    if (!internalCall) this.currentTool?.stop();

    this.currentTool = undefined;
  }

  hasCurrentToolActive(): boolean {
    return !!this.currentTool;
  }

  changeHandler(e: StageToolEvent) {
    this.dispatchEvent(new StageToolEvent("change", { detail: e.detail }));
  }

  stopHandler(e: StageToolEvent) {
    this.dispatchEvent(new StageToolEvent("stop", { detail: e.detail }));
    this.stop(true);
  }

  cancelHandler(e: StageToolEvent) {
    this.dispatchEvent(new StageToolEvent("cancel", { detail: e.detail }));
  }
}

function createStageTool(
  stageTool: StageToolEnum,
  data: IStageToolData
): IStageTool {
  switch (stageTool) {
    case StageToolEnum.MOVE:
    case StageToolEnum.SELECT:
      return new MoveTool(data);
    case StageToolEnum.ROTATE:
      return new RotateTool(data);
    case StageToolEnum.PAN:
      return new PanTool(data);
    case StageToolEnum.SCALE: {
      return new ScaleTool(data);
    }
    case StageToolEnum.POINTS_REPOSITION: {
      return new PointsRepositionTool(data);
    }
  }
}
